import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';
import { env } from '../../config/env';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  logger.error({ err, reqId: req.id }, err.message);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || {},
      },
    });
    return;
  }

  // Fallback to 500 for unhandled errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      ...(env.NODE_ENV === 'development' ? { details: err.message, stack: err.stack } : {}),
    },
  });
};
