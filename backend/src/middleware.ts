import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { config } from './config';
import { User } from './models';

export interface AuthedRequest extends Request { user?: { id: string; name: string; email: string; role: 'student' | 'admin' } }

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.codearena || req.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string };
    if (!Types.ObjectId.isValid(payload.sub)) return res.status(401).json({ message: 'Invalid session.' });
    const user = await User.findById(payload.sub).select('name email role');
    if (!user) return res.status(401).json({ message: 'Account no longer exists.' });
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch { res.status(401).json({ message: 'Your session expired. Please sign in again.' }); }
}

export function requireRole(role: 'admin' | 'student') {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) return res.status(403).json({ message: 'You do not have permission to do that.' });
    next();
  };
}

export function errorHandler(error: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[api:error]', error);
  if (error?.name === 'ZodError') return res.status(400).json({ message: error.issues?.[0]?.message || 'Invalid request data.' });
  if (error?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'Images must be 5 MB or smaller.' });
  if (error?.name === 'MulterError') return res.status(400).json({ message: error.message });
  if (error?.message?.startsWith('Upload a PNG')) return res.status(415).json({ message: error.message });
  if (error?.name === 'ValidationError') return res.status(400).json({ message: error.message });
  if (error?.code === 11000) return res.status(409).json({ message: 'An account with that email already exists.' });
  if (error?.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier.' });
  res.status(error?.status || 500).json({ message: error?.message || 'An unexpected server error occurred.' });
}
