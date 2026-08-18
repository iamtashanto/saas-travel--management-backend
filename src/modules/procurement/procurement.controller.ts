import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../../utils/response';
import { ProcurementService } from './procurement.service';

export class ProcurementController {
  // ---- PURCHASE REQUESTS ----
  static async createPR(req: Request, res: Response, next: NextFunction) {
    try {
      const pr = await ProcurementService.createPurchaseRequest(req.tenant!.organizationId, req.user!.id, req.body);
      sendResponse(res, 201, true, 'Purchase Request created', pr);
    } catch (error) { next(error); }
  }

  static async listPRs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10' } = req.query;
      const result = await ProcurementService.listPurchaseRequests(req.tenant!.organizationId, Number(page), Number(limit));
      sendResponse(res, 200, true, 'Purchase Requests retrieved', result.data, { page: result.page, limit: result.limit, total: result.total });
    } catch (error) { next(error); }
  }

  static async getPR(req: Request, res: Response, next: NextFunction) {
    try {
      const pr = await ProcurementService.getPurchaseRequest(req.params.id, req.tenant!.organizationId);
      sendResponse(res, 200, true, 'Purchase Request retrieved', pr);
    } catch (error) { next(error); }
  }

  static async updatePRStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const pr = await ProcurementService.updatePurchaseRequestStatus(req.params.id, req.tenant!.organizationId, req.body.status);
      sendResponse(res, 200, true, 'Purchase Request status updated', pr);
    } catch (error) { next(error); }
  }

  // ---- PURCHASE ORDERS ----
  static async createPO(req: Request, res: Response, next: NextFunction) {
    try {
      const po = await ProcurementService.createPurchaseOrder(req.tenant!.organizationId, req.body);
      sendResponse(res, 201, true, 'Purchase Order created', po);
    } catch (error) { next(error); }
  }

  static async listPOs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10' } = req.query;
      const result = await ProcurementService.listPurchaseOrders(req.tenant!.organizationId, Number(page), Number(limit));
      sendResponse(res, 200, true, 'Purchase Orders retrieved', result.data, { page: result.page, limit: result.limit, total: result.total });
    } catch (error) { next(error); }
  }

  static async getPO(req: Request, res: Response, next: NextFunction) {
    try {
      const po = await ProcurementService.getPurchaseOrder(req.params.id, req.tenant!.organizationId);
      sendResponse(res, 200, true, 'Purchase Order retrieved', po);
    } catch (error) { next(error); }
  }

  // ---- GOODS RECEIPTS ----
  static async createGR(req: Request, res: Response, next: NextFunction) {
    try {
      const gr = await ProcurementService.createGoodsReceipt(req.tenant!.organizationId, req.user!.id, req.body);
      sendResponse(res, 201, true, 'Goods Receipt created', gr);
    } catch (error) { next(error); }
  }

  static async getGR(req: Request, res: Response, next: NextFunction) {
    try {
      const gr = await ProcurementService.getGoodsReceipt(req.params.id, req.tenant!.organizationId);
      sendResponse(res, 200, true, 'Goods Receipt retrieved', gr);
    } catch (error) { next(error); }
  }
}
