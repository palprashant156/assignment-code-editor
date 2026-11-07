import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Assessment, AssessmentSession, Submission, Upload, User } from './models';
import { AuthedRequest, requireAuth, requireRole } from './middleware';
import { config } from './config';
import { validateImageContent } from './uploadValidation';

const router = Router();
const asyncRoute = (fn: (req: any, res: any) => Promise<any>) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res)).catch(next);
const idOk = (id: string | string[]) => Types.ObjectId.isValid(String(Array.isArray(id) ? id[0] : id));
const codeSchema = z.object({ htmlCode: z.string().max(500_000), cssCode: z.string().max(500_000), jsCode: z.string().max(500_000) });
const publicAssessment = (a: any) => ({ id: String(a.id || a._id), title: a.title, description: a.description, durationMinutes: a.durationMinutes, requirements: a.requirements || [], referenceImages: a.referenceImages || [], availableFrom: a.availableFrom, availableUntil: a.availableUntil, status: a.status, starterCode: a.starterCode });

const authLimit = rateLimit({ windowMs: 15 * 60_000, limit: 30, standardHeaders: true, legacyHeaders: false });
router.post('/auth/register', authLimit, asyncRoute(async (req, res) => {
  const body = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(254), password: z.string().min(8).max(128) }).parse(req.body);
  const email = body.email.toLowerCase();
  if (await User.exists({ email })) return res.status(409).json({ message: 'An account with this email already exists.' });
  const user = await User.create({ name: body.name, email, passwordHash: await bcrypt.hash(body.password, 12), role: 'student' });
  setAuthCookie(res, user.id);
  res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}));
router.post('/auth/login', authLimit, asyncRoute(async (req, res) => {
  const body = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(128) }).parse(req.body);
  const user = await User.findOne({ email: body.email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  setAuthCookie(res, user.id);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}));
router.post('/auth/logout', (_req, res) => { res.clearCookie('codearena', cookieOptions()); res.json({ success: true }); });
router.get('/auth/me', requireAuth, (req: AuthedRequest, res) => res.json({ user: req.user }));

function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSecure ? 'none' as const : 'lax' as const,
    path: '/',
  };
}
function setAuthCookie(res: any, userId: string) {
  const token = jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: '12h' });
  res.cookie('codearena', token, { ...cookieOptions(), maxAge: 12 * 60 * 60 * 1000 });
}

router.get('/assessments', requireAuth, asyncRoute(async (req: AuthedRequest, res) => {
  const now = new Date();
  const filter = req.user!.role === 'admin' ? {} : { status: 'published' };
  const rows = await Assessment.find(filter).sort({ availableFrom: 1, createdAt: -1 }).lean();
  const sessions = await AssessmentSession.find({ studentId: req.user!.id }).select('assessmentId status startedAt expiresAt submittedAt').lean();
  const map = new Map(sessions.map((s: any) => [String(s.assessmentId), s]));
  res.json({ assessments: rows.map((a: any) => {
    const session: any = map.get(String(a._id));
    let status = a.status === 'draft' ? 'Draft' : a.availableFrom && now < a.availableFrom ? 'Upcoming' : a.availableUntil && now > a.availableUntil ? 'Expired' : 'Available';
    if (session?.status === 'in_progress') status = new Date(session.expiresAt) <= now ? 'Expired' : 'In Progress';
    if (session?.status === 'submitted') status = 'Submitted';
    return { ...publicAssessment(a), status, sessionId: session?._id, expiresAt: session?.expiresAt, submittedAt: session?.submittedAt };
  }) });
}));
router.get('/assessments/:id', requireAuth, asyncRoute(async (req: AuthedRequest, res) => {
  if (!idOk(req.params.id)) return res.status(400).json({ message: 'Invalid assessment id.' });
  const assessment = await Assessment.findById(req.params.id);
  if (!assessment || (assessment.status !== 'published' && req.user!.role !== 'admin')) return res.status(404).json({ message: 'Assessment not found.' });
  res.json({ assessment: publicAssessment(assessment) });
}));

const admin = [requireAuth, requireRole('admin')];
const assessmentInput = z.object({
  title: z.string().trim().min(3).max(140), description: z.string().trim().min(10).max(10000),
  durationMinutes: z.coerce.number().int().min(1).max(480), status: z.enum(['draft', 'published']).default('draft'),
  requirements: z.array(z.string().trim().min(1).max(500)).max(30).default([]),
  referenceImages: z.array(z.string().max(2000)).max(8).default([]),
  availableFrom: z.coerce.date().optional().nullable(), availableUntil: z.coerce.date().optional().nullable(),
  starterCode: z.object({ html: z.string().max(500_000).default(''), css: z.string().max(500_000).default(''), js: z.string().max(500_000).default('') }).default({ html: '', css: '', js: '' }),
});
router.post('/assessments', admin, asyncRoute(async (req: AuthedRequest, res) => {
  const input = assessmentInput.parse(req.body);
  if (input.availableFrom && input.availableUntil && input.availableUntil <= input.availableFrom) return res.status(400).json({ message: 'End date must be after the start date.' });
  const assessment = await Assessment.create({ ...input, createdBy: req.user!.id });
  res.status(201).json({ assessment: publicAssessment(assessment) });
}));
router.put('/assessments/:id', admin, asyncRoute(async (req: AuthedRequest, res) => {
  if (!idOk(req.params.id)) return res.status(400).json({ message: 'Invalid assessment id.' });
  const input = assessmentInput.partial().parse(req.body);
  const current = await Assessment.findById(req.params.id);
  if (!current) return res.status(404).json({ message: 'Assessment not found.' });
  const availableFrom = input.availableFrom === undefined ? current.availableFrom : input.availableFrom;
  const availableUntil = input.availableUntil === undefined ? current.availableUntil : input.availableUntil;
  if (availableFrom && availableUntil && availableUntil <= availableFrom) return res.status(400).json({ message: 'End date must be after the start date.' });
  const assessment = await Assessment.findByIdAndUpdate(req.params.id, input, { new: true, runValidators: true });
  res.json({ assessment: publicAssessment(assessment) });
}));
router.delete('/assessments/:id', admin, asyncRoute(async (req, res) => {
  if (!idOk(req.params.id)) return res.status(400).json({ message: 'Invalid assessment id.' });
  const used = await AssessmentSession.exists({ assessmentId: req.params.id });
  if (used) return res.status(409).json({ message: 'Assessments with student activity cannot be deleted. Unpublish it instead.' });
  const assessment = await Assessment.findByIdAndDelete(req.params.id);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found.' });
  res.json({ success: true });
}));

router.post('/assessments/:id/start', requireAuth, requireRole('student'), asyncRoute(async (req: AuthedRequest, res) => {
  const assessment = await Assessment.findOne({ _id: req.params.id, status: 'published' });
  if (!assessment) return res.status(404).json({ message: 'Assessment not found or not published.' });
  const now = new Date();
  if (assessment.availableFrom && now < assessment.availableFrom) return res.status(403).json({ message: 'This assessment is not open yet.' });
  if (assessment.availableUntil && now > assessment.availableUntil) return res.status(403).json({ message: 'The assessment availability window has ended.' });
  let session = await AssessmentSession.findOne({ assessmentId: assessment.id, studentId: req.user!.id });
  if (session?.status === 'submitted') return res.status(409).json({ message: 'This assessment has already been submitted.' });
  if (session?.status === 'in_progress' && session.expiresAt <= now) {
    await finalizeSession(session, 'automatic');
    return res.status(410).json({ message: 'Time has expired. Your saved work was submitted automatically.' });
  }
  if (!session) {
    const startedAt = now;
    session = await AssessmentSession.create({ studentId: req.user!.id, assessmentId: assessment.id, startedAt, expiresAt: new Date(startedAt.getTime() + assessment.durationMinutes * 60_000), htmlCode: assessment.starterCode?.html || '', cssCode: assessment.starterCode?.css || '', jsCode: assessment.starterCode?.js || '' });
  }
  res.json({ assessment: publicAssessment(assessment), session: serializeSession(session) });
}));
router.get('/assessments/:id/session', requireAuth, requireRole('student'), asyncRoute(async (req: AuthedRequest, res) => {
  const session = await AssessmentSession.findOne({ assessmentId: req.params.id, studentId: req.user!.id }).populate('uploadedAssets');
  if (!session) return res.status(404).json({ message: 'No session found. Start the assessment first.' });
  if (session.status === 'in_progress' && session.expiresAt <= new Date()) await finalizeSession(session, 'automatic');
  res.json({ session: serializeSession(session) });
}));
router.put('/assessments/:id/progress', requireAuth, requireRole('student'), asyncRoute(async (req: AuthedRequest, res) => {
  const code = codeSchema.parse(req.body);
  const session = await AssessmentSession.findOne({ assessmentId: req.params.id, studentId: req.user!.id });
  if (!session) return res.status(404).json({ message: 'Assessment session not found.' });
  if (session.status !== 'in_progress') return res.status(409).json({ message: 'This assessment is no longer editable.' });
  if (session.expiresAt <= new Date()) {
    await finalizeSession(session, 'automatic');
    return res.status(410).json({ message: 'Time has expired. Your saved work was submitted automatically.' });
  }
  session.htmlCode = code.htmlCode; session.cssCode = code.cssCode; session.jsCode = code.jsCode;
  await session.save();
  res.json({ savedAt: session.updatedAt, status: session.status });
}));
router.post('/assessments/:id/submit', requireAuth, requireRole('student'), asyncRoute(async (req: AuthedRequest, res) => {
  const payload = z.object({ automatic: z.boolean().optional(), htmlCode: z.string().max(500_000).optional(), cssCode: z.string().max(500_000).optional(), jsCode: z.string().max(500_000).optional() }).parse(req.body || {});
  const { automatic = false } = payload;
  const session = await AssessmentSession.findOne({ assessmentId: req.params.id, studentId: req.user!.id });
  if (!session) return res.status(404).json({ message: 'Assessment session not found.' });
  if (session.status === 'submitted') {
    const submission = await Submission.findOne({ sessionId: session.id });
    return res.json({ submitted: true, submissionId: submission?.id, submittedAt: session.submittedAt, submissionType: submission?.submissionType });
  }
  const timedOut = session.expiresAt <= new Date();
  if (timedOut && !automatic) return res.status(410).json({ message: 'The deadline passed. Use automatic submission to submit your latest saved work.' });
  if (automatic && !timedOut) return res.status(400).json({ message: 'Automatic submission is only allowed after the deadline.' });
  if (!timedOut) {
    const code = codeSchema.parse(req.body || {});
    session.htmlCode = code.htmlCode; session.cssCode = code.cssCode; session.jsCode = code.jsCode;
  } else if (automatic && payload.htmlCode !== undefined && payload.cssCode !== undefined && payload.jsCode !== undefined) {
    session.htmlCode = payload.htmlCode; session.cssCode = payload.cssCode; session.jsCode = payload.jsCode;
  }
  const submission = await finalizeSession(session, timedOut ? 'automatic' : 'manual');
  res.status(201).json({ submitted: true, submissionId: submission.id, submittedAt: submission.submittedAt, submissionType: submission.submissionType });
}));

function serializeSession(session: any) {
  return { id: session.id, startedAt: session.startedAt, expiresAt: session.expiresAt, submittedAt: session.submittedAt, status: session.status, htmlCode: session.htmlCode, cssCode: session.cssCode, jsCode: session.jsCode, uploadedAssets: (session.uploadedAssets || []).map((asset: any) => typeof asset === 'object' ? { id: asset.id, originalName: asset.originalName, mimeType: asset.mimeType, size: asset.size, url: `/api/uploads/${asset.id}` } : asset) };
}
async function finalizeSession(session: any, type: 'manual' | 'automatic') {
  const existing = await Submission.findOne({ sessionId: session.id });
  if (existing) return existing;
  const submittedAt = new Date();
  session.status = 'submitted'; session.submittedAt = submittedAt;
  await session.save();
  try {
    return await Submission.create({ studentId: session.studentId, assessmentId: session.assessmentId, sessionId: session.id, htmlCode: session.htmlCode, cssCode: session.cssCode, jsCode: session.jsCode, uploadedAssets: session.uploadedAssets, submittedAt, submissionType: type });
  } catch (error: any) {
    if (error?.code === 11000) return (await Submission.findOne({ sessionId: session.id }))!;
    throw error;
  }
}

export async function submitExpiredSessions() {
  const expired = await AssessmentSession.find({ status: 'in_progress', expiresAt: { $lte: new Date() } }).limit(100);
  for (const session of expired) {
    try { await finalizeSession(session, 'automatic'); }
    catch (error) { console.error(`Could not auto-submit expired session ${session.id}:`, error); }
  }
}

const uploadLimit = rateLimit({ windowMs: 60 * 60_000, limit: 40, standardHeaders: true, legacyHeaders: false });
const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 }, fileFilter: (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed: Record<string, string[]> = { '.png': ['image/png'], '.jpg': ['image/jpeg'], '.jpeg': ['image/jpeg'], '.webp': ['image/webp'], '.svg': ['image/svg+xml'] };
  if (!allowed[ext]?.includes(file.mimetype)) return cb(new Error('Upload a PNG, JPG, WebP, or SVG image.'));
  cb(null, true);
} });
router.post('/uploads', requireAuth, uploadLimit, memoryUpload.single('file'), asyncRoute(async (req: AuthedRequest, res) => {
  if (!req.file) return res.status(400).json({ message: 'Choose an image to upload.' });
  const purpose = req.body.purpose === 'reference' ? 'reference' : 'asset';
  const assessmentId = String(req.body.assessmentId || '');
  if (assessmentId && !idOk(assessmentId)) return res.status(400).json({ message: 'Invalid assessmentId.' });
  let session: any = null;
  if (purpose === 'reference') {
    if (req.user!.role !== 'admin') return res.status(403).json({ message: 'Only instructors can upload reference images.' });
  } else {
    if (!assessmentId) return res.status(400).json({ message: 'A valid assessmentId is required.' });
    session = await AssessmentSession.findOne({ assessmentId, studentId: req.user!.id, status: 'in_progress' });
    if (req.user!.role !== 'student' || !session || session.expiresAt <= new Date()) return res.status(403).json({ message: 'An active assessment session is required.' });
  }
  const { buffer, mimetype, originalname } = req.file;
  const ext = path.extname(originalname).toLowerCase();
  const safeBuffer = validateImageContent(ext, buffer);
  if (!safeBuffer) return res.status(415).json({ message: 'File content does not match a supported safe image format.' });
  await fs.mkdir(config.uploadDir, { recursive: true });
  const filename = `${randomUUID()}${ext}`;
  await fs.writeFile(path.join(config.uploadDir, filename), safeBuffer, { flag: 'wx' });
  const upload = await Upload.create({ ownerId: req.user!.id, ...(assessmentId ? { assessmentId } : {}), sessionId: session?.id, filename, originalName: path.basename(originalname).slice(0, 180), mimeType: mimetype, size: safeBuffer.length, purpose });
  if (session) { session.uploadedAssets.push(upload.id); await session.save(); }
  res.status(201).json({ asset: { id: upload.id, originalName: upload.originalName, mimeType: upload.mimeType, size: upload.size, url: `/api/uploads/${upload.id}` } });
}));
router.get('/uploads/:id', requireAuth, asyncRoute(async (req: AuthedRequest, res) => {
  if (!idOk(req.params.id)) return res.status(400).json({ message: 'Invalid asset id.' });
  const upload: any = await Upload.findById(req.params.id);
  if (!upload) return res.status(404).json({ message: 'Asset not found.' });
  const linkedReference = upload.purpose === 'reference' && await Assessment.exists({ status: 'published', referenceImages: `/api/uploads/${upload.id}` });
  const allowed = req.user!.role === 'admin' || String(upload.ownerId) === req.user!.id || Boolean(linkedReference);
  if (!allowed) return res.status(404).json({ message: 'Asset not found.' });
  const filePath = path.join(config.uploadDir, path.basename(upload.filename));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
  res.type(upload.mimeType).sendFile(filePath);
}));
router.delete('/uploads/:id', requireAuth, requireRole('student'), asyncRoute(async (req: AuthedRequest, res) => {
  if (!idOk(req.params.id)) return res.status(400).json({ message: 'Invalid asset id.' });
  const upload: any = await Upload.findOne({ _id: req.params.id, ownerId: req.user!.id });
  if (!upload) return res.status(404).json({ message: 'Asset not found.' });
  const session = await AssessmentSession.findOne({ _id: upload.sessionId, status: 'in_progress', expiresAt: { $gt: new Date() } });
  if (!session) return res.status(409).json({ message: 'Asset is part of a locked or submitted assessment.' });
  session.uploadedAssets = session.uploadedAssets.filter((id: any) => String(id) !== upload.id);
  await session.save(); await Upload.deleteOne({ _id: upload.id });
  await fs.unlink(path.join(config.uploadDir, path.basename(upload.filename))).catch(() => undefined);
  res.json({ success: true });
}));

router.get('/submissions/me', requireAuth, asyncRoute(async (req: AuthedRequest, res) => {
  const submissions = await Submission.find({ studentId: req.user!.id }).populate('assessmentId', 'title durationMinutes').sort({ submittedAt: -1 }).limit(100).lean();
  res.json({ submissions: submissions.map((s: any) => ({ id: s._id, assessment: s.assessmentId, submittedAt: s.submittedAt, submissionType: s.submissionType })) });
}));
router.get('/submissions/:id', requireAuth, asyncRoute(async (req: AuthedRequest, res) => {
  if (!idOk(req.params.id)) return res.status(400).json({ message: 'Invalid submission id.' });
  const filter = req.user!.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, studentId: req.user!.id };
  const submission = await Submission.findOne(filter).populate('studentId', 'name email').populate('assessmentId', 'title').populate('uploadedAssets');
  if (!submission) return res.status(404).json({ message: 'Submission not found.' });
  res.json({ submission });
}));
router.get('/admin/submissions', requireAuth, requireRole('admin'), asyncRoute(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1), limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const [submissions, total] = await Promise.all([
    Submission.find().populate('studentId', 'name email').populate('assessmentId', 'title').sort({ submittedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Submission.countDocuments(),
  ]);
  res.json({ submissions, page, limit, total, pages: Math.ceil(total / limit) });
}));
router.get('/admin/students', requireAuth, requireRole('admin'), asyncRoute(async (_req, res) => {
  const students = await User.find({ role: 'student' }).select('name email createdAt').sort({ createdAt: -1 }).limit(500).lean();
  const sessions = await AssessmentSession.aggregate([{ $group: { _id: '$studentId', count: { $sum: 1 }, submitted: { $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] } } } }]);
  const stats = new Map(sessions.map((s: any) => [String(s._id), s]));
  res.json({ students: students.map((s: any) => ({ ...s, ...(stats.get(String(s._id)) || { count: 0, submitted: 0 }) })) });
}));
router.get('/health', (_req, res) => res.json({ status: 'ok' }));

export default router;
