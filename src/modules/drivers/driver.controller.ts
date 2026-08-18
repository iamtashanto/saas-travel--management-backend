import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../../utils/response';
import { DriverService } from './driver.service';

export class DriverController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search, status } = req.query;
      const result = await DriverService.listDrivers(
        req.tenant!.organizationId,
        Number(page),
        Number(limit),
        search as string,
        status as string
      );
      sendResponse(res, 200, true, 'Drivers retrieved', result.data, { page: result.page, limit: result.limit, total: result.total });
    } catch (error) { next(error); }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await DriverService.getDriver(req.params.id, req.tenant!.organizationId);
      sendResponse(res, 200, true, 'Driver retrieved', driver);
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await DriverService.createDriver(req.tenant!.organizationId, req.body);
      sendResponse(res, 201, true, 'Driver created', driver);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await DriverService.updateDriver(req.params.id, req.tenant!.organizationId, req.body);
      sendResponse(res, 200, true, 'Driver updated', updated);
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await DriverService.deleteDriver(req.params.id, req.tenant!.organizationId);
      sendResponse(res, 200, true, 'Driver archived');
    } catch (error) { next(error); }
  }

  static async addDutyLog(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await DriverService.addDutyLog(req.params.id, req.tenant!.organizationId, req.body);
      sendResponse(res, 201, true, 'Duty log added', log);
    } catch (error) { next(error); }
  }
}
