import { Request, Response } from 'express';
import { LoyaltyService } from './loyalty.service';

export class LoyaltyController {
  static getCustomerAccount = async (req: Request, res: Response) => {
    const account = await LoyaltyService.getAccountByCustomerId(req.params.customerId);
    res.json({
      success: true,
      data: account,
    });
  };

  static adjustBalance = async (req: Request, res: Response) => {
    const result = await LoyaltyService.adjustBalance(req.params.accountId, req.body);
    res.json({
      success: true,
      data: result,
    });
  };

  static getTransactions = async (req: Request, res: Response) => {
    const transactions = await LoyaltyService.getTransactionHistory(req.params.accountId);
    res.json({
      success: true,
      data: transactions,
    });
  };
}
