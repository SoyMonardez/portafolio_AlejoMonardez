import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';

import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { cache } from './utils/cache.js';
import { jobQueue } from './utils/jobQueue.js';

import authRouter      from './routes/auth.js';
import projectsRouter  from './routes/projects.js';
import messagesRouter  from './routes/messages.js';
import contactRouter   from './routes/contact.js';
import settingsRouter  from './routes/settings.js';
import uploadRouter    from './routes/upload.js';
import instagramRouter from './routes/instagram.js';
import aiRouter         from './routes/ai.js';

export function buildApp() {
    const app = express();

    // Si corre detrás de Nginx en el VPS, esto hace que rate-limit use la IP real.
    app.set('trust proxy', 1);

    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));

    app.use(cors({
        origin: (origin, cb) => {
            // Permitimos requests sin origin (curl, mismo host)
            if (!origin) return cb(null, true);
            if (env.corsOrigins.includes('*')) return cb(null, true);
            if (env.corsOrigins.includes(origin)) return cb(null, true);
            cb(new Error(`CORS: origen no permitido (${origin})`));
        },
        credentials: false,
    }));

    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Sirve archivos subidos. En producción esto lo hace Nginx directo (más rápido),
    // pero acá lo dejamos para dev/local-only.
    //   /uploads/projects → imágenes de proyectos
    //   /uploads/cv       → curriculum vitae actual
    const uploadAbs = path.resolve(process.cwd(), env.upload.dir);
    const cvAbs     = path.resolve(uploadAbs, '..', 'cv');
    app.use(env.upload.publicBase, express.static(uploadAbs));
    app.use(env.upload.publicBase.replace(/\/projects$/, '') + '/cv', express.static(cvAbs));

    // Health — incluye métricas de cache y cola para monitoreo
    app.get('/health', (_req, res) => res.json({
        ok: true,
        env: env.nodeEnv,
        cache: cache.stats(),
        queue: jobQueue.stats(),
    }));

    // API
    app.use('/auth',      authRouter);
    app.use('/projects',  projectsRouter);
    app.use('/messages',  messagesRouter);
    app.use('/contact',   contactRouter);
    app.use('/settings',  settingsRouter);
    app.use('/upload',    uploadRouter);
    app.use('/instagram', instagramRouter);
    app.use('/ai',        aiRouter);

    // Sirve /uploads/instagram/* en dev (en prod lo hace Nginx directamente)
    const igAbs = path.resolve(process.cwd(), env.upload.dir, '..', 'instagram');
    app.use('/uploads/instagram', express.static(igAbs));

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
