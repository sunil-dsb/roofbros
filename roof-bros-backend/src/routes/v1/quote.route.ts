import express, { type Router } from 'express';
import {
  createQuote,
  getQuotesByJobId,
  getQuoteById,
} from '../../controllers/v1/quote.controller.ts';
import { validate, validateParams } from '../../shared/middlewares/validate.ts';
import { createQuoteSchema } from '../../shared/validations/quote.validation.ts';
import { requireAuth } from '../../shared/middlewares/authenticate.middlewares.ts';
import {
  apiReadLimiter,
  apiWriteLimiter,
  apiSearchLimiter,
} from '../../shared/middlewares/rateLimit.middleware.ts';
import { z } from 'zod';

const quoteRoute: Router = express.Router();

quoteRoute.post(
  '/:jobId',
  apiWriteLimiter,
  requireAuth,
  validateParams(z.object({ jobId: z.string().uuid('Invalid Job ID') })),
  validate(createQuoteSchema),
  createQuote,
);

quoteRoute.get(
  '/:jobId',
  apiSearchLimiter,
  requireAuth,
  validateParams(z.object({ jobId: z.string().uuid('Invalid Job ID') })),
  getQuotesByJobId,
);

quoteRoute.get(
  '/single/:quoteId',
  apiReadLimiter,
  requireAuth,
  validateParams(z.object({ quoteId: z.string().uuid('Invalid Quote ID') })),
  getQuoteById,
);

export default quoteRoute;
