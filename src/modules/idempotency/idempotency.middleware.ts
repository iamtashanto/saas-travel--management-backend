import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { AppError } from '../../utils/app-error';
import crypto from 'crypto';

export const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  
  if (!idempotencyKey) {
    return next(); // Proceed normally if no key provided
  }

  if (idempotencyKey.length < 10 || idempotencyKey.length > 100) {
    return next(new AppError(400, 'INVALID_IDEMPOTENCY_KEY', 'Idempotency key must be between 10 and 100 characters'));
  }

  const organizationId = req.tenant!.organizationId;

  // Calculate request hash to ensure body hasn't changed for the same key
  const requestHash = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex');

  try {
    const existingRecord = await prisma.idempotencyRecord.findUnique({
      where: { organizationId_key: { organizationId, key: idempotencyKey } },
    });

    if (existingRecord) {
      if (existingRecord.requestHash !== requestHash) {
        return next(new AppError(409, 'IDEMPOTENCY_MISMATCH', 'A request with this idempotency key was already made with a different payload.'));
      }

      if (existingRecord.status === 'COMPLETED') {
        // Return the cached response
        const cachedResponse = existingRecord.response as any;
        return res.status(cachedResponse.statusCode || 200).json(cachedResponse.body);
      } else if (existingRecord.status === 'IN_PROGRESS') {
        return next(new AppError(409, 'IDEMPOTENCY_IN_PROGRESS', 'A request with this idempotency key is currently being processed.'));
      } else {
        // Retry failed/errored request
        await prisma.idempotencyRecord.update({
          where: { id: existingRecord.id },
          data: { status: 'IN_PROGRESS', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        });
      }
    } else {
      await prisma.idempotencyRecord.create({
        data: {
          organizationId,
          key: idempotencyKey,
          requestHash,
          status: 'IN_PROGRESS',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Keep for 24 hours
        },
      });
    }

    // Intercept res.json to save the response
    const originalJson = res.json;
    res.json = function (body: any) {
      // Don't await this, let it run in background to not block response
      prisma.idempotencyRecord.update({
        where: { organizationId_key: { organizationId, key: idempotencyKey } },
        data: {
          status: res.statusCode >= 200 && res.statusCode < 300 ? 'COMPLETED' : 'FAILED',
          response: {
            statusCode: res.statusCode,
            body,
          },
        },
      }).catch((err) => console.error('Failed to update idempotency record', err));

      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return next(new AppError(409, 'IDEMPOTENCY_IN_PROGRESS', 'A request with this idempotency key is currently being processed.'));
    }
    next(error);
  }
};
