import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../../utils/response';
import { VehicleService } from './vehicle.service';

export class VehicleController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search, status } = req.query;
      const result = await VehicleService.listVehicles(
        req.tenant!.organizationId,
        Number(page),
        Number(limit),
        search as string,
        status as string
      );
      sendResponse(res, 200, true, 'Vehicles retrieved', result.data, { page: result.page, limit: result.limit, total: result.total });
    } catch (error) { next(error); }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.getVehicle(req.params.id, req.tenant!.organizationId);
      sendResponse(res, 200, true, 'Vehicle retrieved', vehicle);
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.createVehicle(req.tenant!.organizationId, req.body);
      sendResponse(res, 201, true, 'Vehicle created', vehicle);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await VehicleService.updateVehicle(req.params.id, req.tenant!.organizationId, req.body);
      sendResponse(res, 200, true, 'Vehicle updated', updated);
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await VehicleService.deleteVehicle(req.params.id, req.tenant!.organizationId);
      sendResponse(res, 200, true, 'Vehicle archived');
    } catch (error) { next(error); }
  }

  // Extensions
  static async addDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await VehicleService.addDocument(req.params.id, req.tenant!.organizationId, req.body);
      sendResponse(res, 201, true, 'Document added', doc);
    } catch (error) { next(error); }
  }

  static async addTripLog(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await VehicleService.addTripLog(req.params.id, req.tenant!.organizationId, req.body);
      sendResponse(res, 201, true, 'Trip log added', log);
    } catch (error) { next(error); }
  }

  static async addFuelRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await VehicleService.addFuelRecord(req.params.id, req.tenant!.organizationId, req.body);
      sendResponse(res, 201, true, 'Fuel record added', record);
    } catch (error) { next(error); }
  }

  static async addMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await VehicleService.addMaintenance(req.params.id, req.tenant!.organizationId, req.body);
      sendResponse(res, 201, true, 'Maintenance record added', record);
    } catch (error) { next(error); }
  }

  static async addRental(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await VehicleService.addRental(req.params.id, req.tenant!.organizationId, req.body);
      sendResponse(res, 201, true, 'Rental record added', record);
    } catch (error) { next(error); }
  }
}
