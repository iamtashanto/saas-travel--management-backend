import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service';
import { sendResponse } from '../../utils/response';

export class CustomerController {
  static async listCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomerService.listCustomers(req.tenant!.organizationId, req.query as any);
      sendResponse(res, 200, true, 'Customers retrieved successfully', result.data, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomerService.getCustomerById(req.params.id, req.tenant!.organizationId);
      sendResponse(res, 200, true, 'Customer retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomerService.createCustomer(req.tenant!.organizationId, req.body, req.user!.userId);
      sendResponse(res, 201, true, 'Customer created successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomerService.updateCustomer(req.params.id, req.tenant!.organizationId, req.body, req.user!.userId);
      sendResponse(res, 200, true, 'Customer updated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async mergeCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomerService.mergeCustomers(req.tenant!.organizationId, req.params.id, req.body.targetCustomerId, req.user!.userId);
      sendResponse(res, 200, true, 'Customers merged successfully', result);
    } catch (error) {
      next(error);
    }
  }
}
