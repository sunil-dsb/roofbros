import { type Request, type Response, type NextFunction } from 'express';
import ApiError from '../utils/ApiError.ts';
import httpStatus from 'http-status';
import config from '../../config/index.ts';
import * as Sentry from '@sentry/node';
import { logger } from '../../config/logger.ts';
import multer from 'multer';

interface ErrorLike {
  statusCode?: number;
  message?: string;
  stack?: string;
}

const getErrorCode = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 429:
      return 'TOO_MANY_REQUESTS';
    default:
      return 'INTERNAL_ERROR';
  }
};

const errorConverter = (
  err: Error | ErrorLike,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error: Error | ApiError =
    err instanceof Error ? err : new Error(String(err));
  Sentry.captureException(error);

  if (error.name === 'MulterError') {
    const multerError = error as multer.MulterError;
    if (multerError.code === 'LIMIT_UNEXPECTED_FILE') {
      error = new ApiError(
        'Cannot upload more than 5 images',
        httpStatus.BAD_REQUEST,
      );
    } else {
      error = new ApiError(multerError.message, httpStatus.BAD_REQUEST);
    }
    (error as ApiError).errorCode = 'VALIDATION_ERROR';
  } else if (!(error instanceof ApiError)) {
    const rawError = error as ErrorLike;
    const statusCode: number =
      typeof rawError.statusCode === 'number'
        ? rawError.statusCode
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message: string =
      (typeof rawError.message === 'string' ? rawError.message : '') ||
      (httpStatus as Record<number, string | undefined>)[statusCode] ||
      'Internal Server Error';
    const stack = typeof rawError.stack === 'string' ? rawError.stack : '';
    error = new ApiError(message, statusCode, false, stack);
  }
  next(error);
};

const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  let { statusCode, message } = err;

  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }
  Sentry.captureException(err);

  res.locals.errorMessage = err.message;

  const responseCode = err.errorCode || getErrorCode(statusCode);

  const response = {
    success: false,
    code: responseCode,
    message,
    // Array details (e.g. Zod field-level issues) are nested under `errors`.
    // Plain-object details (e.g. { emailVerified: false }) are spread at the
    // root so the frontend can read them directly (e.g. response.emailVerified).
    ...(Array.isArray(err.details)
      ? { errors: err.details }
      : err.details !== undefined && err.details),
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};

export { errorConverter, errorHandler };
