import path from 'node:path';

export const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codearena',
  jwtSecret: process.env.JWT_SECRET || 'local-development-secret-change-me',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  uploadDir: path.resolve(process.env.UPLOAD_DIR || 'backend/uploads'),
};
