import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import path from 'node:path';
import fs from 'node:fs';
import { config } from './config';
import { Assessment, User } from './models';
import routes, { submitExpiredSessions } from './routes';
import { errorHandler } from './middleware';

const app = express();
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'], imgSrc: ["'self'", 'data:', 'blob:'],
    connectSrc: ["'self'"], workerSrc: ["'self'", 'blob:'], objectSrc: ["'none'"],
  } },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use((req, _res, next) => { console.info(`${new Date().toISOString()} ${req.method} ${req.path}`); next(); });
app.use('/api', routes);
const clientDist = path.resolve('frontend/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist, { index: false }));
  app.use((req, res, next) => req.path.startsWith('/api/') ? next() : res.sendFile(path.join(clientDist, 'index.html')));
}
app.use((_req, res) => res.status(404).json({ message: 'API endpoint not found.' }));
app.use(errorHandler);

async function bootstrap() {
  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
    throw new Error('Set JWT_SECRET to a random secret with at least 32 characters in production.');
  }
  await mongoose.connect(config.mongoUri);
  console.info('MongoDB connected');

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const email = process.env.ADMIN_EMAIL.toLowerCase();
    await User.updateOne({ email }, { $setOnInsert: { name: 'CodeArena Instructor', email, role: 'admin', passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12) } }, { upsert: true });
  }

  if (!(await Assessment.exists({}))) {
    const admin = process.env.ADMIN_EMAIL ? await User.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase() }) : await User.findOne({ role: 'admin' });
    if (admin) await Assessment.create({
      title: 'Design a creative portfolio landing page',
      description: 'Create a polished personal portfolio hero that introduces a creative professional and invites visitors to explore their work.',
      durationMinutes: 90,
      status: 'published', createdBy: admin.id,
      requirements: ['Use semantic HTML with a clear heading and navigation.', 'Create a responsive hero layout with CSS.', 'Add at least one interactive JavaScript element.', 'Make the layout work on desktop and mobile.'],
      starterCode: {
        html: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Creative Portfolio</title>\n</head>\n<body>\n  <main class="hero">\n    <nav><a class="brand" href="#">MORGAN<span>®</span></a><a href="#work">Selected work ↗</a></nav>\n    <section class="intro">\n      <p class="eyebrow">INDEPENDENT DESIGNER · BROOKLYN, NY</p>\n      <h1>Making digital<br>feel <em>different.</em></h1>\n      <p class="summary">I partner with ambitious teams to build thoughtful brands and digital experiences.</p>\n      <button id="work-button">Explore my work <span>↗</span></button>\n    </section>\n    <div class="availability"><i></i> Available for select projects</div>\n  </main>\n</body>\n</html>',
        css: '* { box-sizing: border-box; }\nbody { margin: 0; min-height: 100vh; background: #edeae3; color: #161714; font-family: Inter, Arial, sans-serif; }\n.hero { min-height: 100vh; padding: 32px 6vw; display: flex; flex-direction: column; }\nnav { display: flex; justify-content: space-between; align-items: center; }\nnav a { color: inherit; text-decoration: none; font-size: 13px; }\n.brand { font-weight: 900; letter-spacing: -1px; font-size: 20px; }\n.brand span { color: #fe5b35; font-size: 10px; vertical-align: top; }\n.intro { margin: auto 0; padding: 70px 0; max-width: 850px; }\n.eyebrow { letter-spacing: 2px; font-size: 11px; font-weight: 700; }\nh1 { font-size: clamp(64px, 10vw, 142px); line-height: .88; letter-spacing: -.09em; margin: 30px 0; }\nh1 em { font-family: Georgia, serif; font-weight: 400; color: #fe5b35; }\n.summary { max-width: 380px; color: #62635e; font-size: 16px; line-height: 1.65; }\nbutton { margin-top: 20px; border: 0; border-radius: 99px; padding: 15px 20px; background: #171815; color: white; cursor: pointer; }\nbutton span { margin-left: 20px; color: #fe5b35; }\n.availability { font-size: 12px; color: #62635e; }\n.availability i { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #65a877; margin-right: 8px; }\n@media (max-width: 600px) { .hero { padding: 24px; } h1 { font-size: 64px; } .intro { padding: 50px 0; } }',
        js: 'document.getElementById("work-button").addEventListener("click", () => {\n  alert("Thanks for stopping by — the portfolio is coming soon!");\n});',
      },
    });
  }

  const expiryWorker = setInterval(() => { void submitExpiredSessions(); }, 5_000);
  expiryWorker.unref();

  app.listen(config.port, () => console.info(`CodeArena API listening on http://localhost:${config.port}`));
}

bootstrap().catch((error) => { console.error('Could not start CodeArena API:', error); process.exit(1); });
