import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'admin'], default: 'student', index: true },
}, { timestamps: true });

const assessmentSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, required: true, maxlength: 10000 },
  durationMinutes: { type: Number, required: true, min: 1, max: 480 },
  starterCode: { html: String, css: String, js: String },
  referenceImages: [{ type: String }],
  requirements: [{ type: String, maxlength: 500 }],
  availableFrom: Date,
  availableUntil: Date,
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
assessmentSchema.index({ status: 1, availableFrom: 1, availableUntil: 1 });

const sessionSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
  startedAt: { type: Date, required: true }, expiresAt: { type: Date, required: true },
  submittedAt: Date, status: { type: String, enum: ['in_progress', 'submitted', 'expired'], default: 'in_progress', index: true },
  htmlCode: { type: String, default: '' }, cssCode: { type: String, default: '' }, jsCode: { type: String, default: '' },
  uploadedAssets: [{ type: Schema.Types.ObjectId, ref: 'Upload' }],
}, { timestamps: true });
sessionSchema.index({ studentId: 1, assessmentId: 1 }, { unique: true });
sessionSchema.index({ expiresAt: 1, status: 1 });

const submissionSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'AssessmentSession', required: true, unique: true },
  htmlCode: String, cssCode: String, jsCode: String,
  uploadedAssets: [{ type: Schema.Types.ObjectId, ref: 'Upload' }],
  submittedAt: { type: Date, required: true, index: true },
  submissionType: { type: String, enum: ['manual', 'automatic'], required: true },
}, { timestamps: true });

const uploadSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', index: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'AssessmentSession', index: true },
  filename: { type: String, required: true }, originalName: String,
  mimeType: String, size: Number, purpose: { type: String, enum: ['asset', 'reference'], default: 'asset' },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);
export const AssessmentSession = mongoose.models.AssessmentSession || mongoose.model('AssessmentSession', sessionSchema);
export const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
export const Upload = mongoose.models.Upload || mongoose.model('Upload', uploadSchema);
