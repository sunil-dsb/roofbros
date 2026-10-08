import rateLimit from 'express-rate-limit';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.ts';
import config from '../../config/index.ts';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const createLimiter = (options: {
  limit: number;
  windowMs?: number;
  skipSuccessfulRequests?: boolean;
  message?: string;
}) =>
  rateLimit({
    windowMs: options.windowMs ?? FIFTEEN_MINUTES,
    limit: options.limit,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests ?? false,
    skip: () => config.env === 'test',
    // Route the rejection through the shared error pipeline so the response
    // shape matches every other error the API emits.
    handler: (_req, _res, next) => {
      next(
        new ApiError(
          options.message ?? 'Too many requests, please try again later.',
          httpStatus.TOO_MANY_REQUESTS,
        ),
      );
    },
  });

/**
 * Only failed attempts count, so a legitimate user signing in repeatedly is
 * never throttled while credential stuffing is.
 */
export const signInLimiter = createLimiter({
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Too many sign in attempts, please try again in 15 minutes.',
});

/** Successful sign ups count too — this caps account-spam per IP. */
export const signUpLimiter = createLimiter({
  limit: 5,
  message: 'Too many accounts created from this IP, please try again later.',
});

export const sessionLimiter = createLimiter({
  limit: 60,
  windowMs: 60 * 1000,
});

export const otpLimiter = createLimiter({
  limit: 5,
  windowMs: 15 * 60 * 1000, // 5 requests per 15 mins
  message: 'Too many OTP requests, please try again later.',
});

export const passwordChangeLimiter = createLimiter({
  limit: 5,
  windowMs: 15 * 60 * 1000,
  message: 'Too many password change attempts, please try again later.',
});

export const passwordResetLimiter = createLimiter({
  limit: 5,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests, please try again later.',
});

export const apiWriteLimiter = createLimiter({
  limit: 100,
  windowMs: 15 * 60 * 1000,
  message: 'Too many write requests, please try again later.',
});

export const apiReadLimiter = createLimiter({
  limit: 500,
  windowMs: 15 * 60 * 1000,
  message: 'Too many read requests, please try again later.',
});

export const apiSearchLimiter = createLimiter({
  limit: 200,
  windowMs: 15 * 60 * 1000,
  message: 'Too many search requests, please try again later.',
});

export const apiUploadLimiter = createLimiter({
  limit: 30,
  windowMs: 15 * 60 * 1000,
  message: 'Too many upload requests, please try again later.',
});
