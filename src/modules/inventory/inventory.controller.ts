import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../../utils/response';
import { InventoryService } from './inventory.service';

export class InventoryController {
  static async createLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await InventoryService.createLocation(req.tenant!.organizationId, req.body);
      sendResponse(res, 201, true, 'Location created', location);
    } catch (error) { next(error); }
  }

  static async listLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const locations = await InventoryService.listLocations(req.tenant!.organizationId);
      sendResponse(res, 200, true, 'Locations retrieved', locations);
    } catch (error) { next(error); }
  }

  static async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await InventoryService.createItem(req.tenant!.organizationId, req.body);
      sendResponse(res, 201, true, 'Inventory item created', item);
    } catch (error) { next(error); }
  }

  static async listItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', category } = req.query;
      const result = await InventoryService.listItems(req.tenant!.organizationId, Number(page), Number(limit), category as string);
      sendResponse(res, 200, true, 'Inventory items retrieved', result.data, { page: result.page, limit: result.limit, total: result.total });
    } catch (error) { next(error); }
  }

  static async getItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await InventoryService.getItem(req.params.id, req.tenant!.organizationId);
      sendResponse(res, 200, true, 'Inventory item retrieved', item);
    } catch (error) { next(error); }
  }

  static async recordMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const movement = await InventoryService.recordMovement(req.tenant!.organizationId, req.user!.id, req.body);
      sendResponse(res, 201, true, 'Stock movement recorded', movement);
    } catch (error) { next(error); }
  }
}
