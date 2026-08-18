import { Request, Response, NextFunction } from 'express';
import { TravelerService } from './traveler.service';
import { sendResponse } from '../../utils/response';

export class TravelerController {
  static async listTravelers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TravelerService.listTravelers(req.tenant!.organizationId, req.query as any);
      sendResponse(res, 200, true, 'Travelers retrieved successfully', result.data, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTravelerById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TravelerService.getTravelerById(req.params.id, req.tenant!.organizationId);
      sendResponse(res, 200, true, 'Traveler retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async createTraveler(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TravelerService.createTraveler(req.tenant!.organizationId, req.body, req.user!.userId);
      sendResponse(res, 201, true, 'Traveler created successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async updateTraveler(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TravelerService.updateTraveler(req.params.id, req.tenant!.organizationId, req.body, req.user!.userId);
      sendResponse(res, 200, true, 'Traveler updated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteTraveler(req: Request, res: Response, next: NextFunction) {
    try {
      await TravelerService.deleteTraveler(req.params.id, req.tenant!.organizationId, req.user!.userId);
      sendResponse(res, 200, true, 'Traveler deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }
}
