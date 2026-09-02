import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import httpStatus from 'http-status';
import { swaggerSpec, swaggerUi, swaggerUiOptions } from './config/swagger.ts';
import routes from './routes/v1/index.ts';
import ApiError from './shared/utils/ApiError.ts';
import { db } from './config/db.ts';
import { sql } from 'drizzle-orm';
import { auth } from './shared/utils/auth.ts';

import {
  errorHandler,
  errorConverter,
} from './shared/middlewares/errorHandler.middleware.ts';
import { logger } from './config/logger.ts';
import { toNodeHandler } from 'better-auth/node';
import config from './config/index.ts';

const app: Express = express();

// -------------------------
//  Request Logging
// -------------------------
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);

// -------------------------
//  Security & General Middleware
// -------------------------
app.use(
  cors({
    origin: config.cors, // Replace with your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
);

app.use(helmet());
app.set('trust proxy', 1);

// -------------------------
//  Rate Limiting
// -------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: httpStatus.TOO_MANY_REQUESTS,
    message: 'Too many requests, please try again later.',
  },
});

app.use(limiter);

// better-auth's own router (email verification, password reset, OAuth
// callbacks). It is mounted on its configured `basePath` so it does not shadow
// the hand-written controllers under /api/v1/auth, and it must be registered
// before express.json() because it consumes the raw request stream.

app.all('/api/auth/{*splat}', toNodeHandler(auth));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------
//  Static Files
// -------------------------
app.use(express.static(path.join(__dirname, '../public')));

// -------------------------
//  Swagger Docs
// -------------------------
// Mounted on /api/docs, not /api: swaggerUi.setup() answers every request under
// its mount path without calling next(), so mounting it on /api swallowed the
// whole /api/v1 surface.
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions),
);

// -------------------------
//  Routes
// -------------------------
app.get('/', (req: Request, res: Response) => {
  res.send('Backend is running successfully prod... 🚀');
});

app.get('/health', async (req: Request, res: Response) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.status(httpStatus.OK).json({ status: 'ok', db: 'connected' });
  } catch (error) {
    logger.error(error);
    res
      .status(httpStatus.SERVICE_UNAVAILABLE)
      .json({ status: 'error', db: 'disconnected' });
  }
});

app.use('/api/v1', routes);

// -------------------------
//  Proxy / Redirect for Uploads
// -------------------------
// Redirects requests like /upload/job/... to the actual R2 URL
app.use('/upload', (req: Request, res: Response) => {
  if (!config.r2Endpoint || !config.bucket) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send('R2 not configured');
    return;
  }
  // req.originalUrl is the full path e.g. "/upload/job/..."
  const targetUrl = `${config.r2Endpoint}/${config.bucket}${req.originalUrl.split('?')[0]}`;
  res.redirect(targetUrl);
});

// -------------------------
//  404 Handler
// -------------------------
app.use((req, res, next) => {
  const error = new ApiError(
    `API not found: ${req.originalUrl}`,
    httpStatus.NOT_FOUND,
    true,
  );
  logger.error(error);
  next(error);
});

// -------------------------
//  Error Handling
// -------------------------
app.use(errorConverter);
app.use(errorHandler);

export default app;
