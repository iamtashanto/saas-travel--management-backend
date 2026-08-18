import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../../utils/response';
import { HotelService } from './hotel.service';

export class HotelController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10', search, city } = req.query;
      const result = await HotelService.listHotels(
        req.tenant!.organizationId,
        Number(page),
        Number(limit),
        search as string,
        city as string
      );
      sendResponse(res, 200, true, 'Hotels retrieved', result.data, { page: result.page, limit: result.limit, total: result.total });
    } catch (error) { next(error); }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const hotel = await HotelService.getHotel(req.params.id, req.tenant!.organizationId);
      sendResponse(res, 200, true, 'Hotel retrieved', hotel);
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const hotel = await HotelService.createHotel(req.tenant!.organizationId, req.body);
      sendResponse(res, 201, true, 'Hotel created', hotel);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await HotelService.updateHotel(req.params.id, req.tenant!.organizationId, req.body);
      sendResponse(res, 200, true, 'Hotel updated', updated);
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await HotelService.deleteHotel(req.params.id, req.tenant!.organizationId);
      sendResponse(res, 200, true, 'Hotel archived');
    } catch (error) { next(error); }
  }

  static async addRoomType(req: Request, res: Response, next: NextFunction) {
    try {
      const roomType = await HotelService.addRoomType(req.params.id, req.tenant!.organizationId, req.body);
      sendResponse(res, 201, true, 'Room type added', roomType);
    } catch (error) { next(error); }
  }
}
