import { Request, Response } from 'express';
import { ReferralService } from './referral.service';

export class ReferralController {
  static createCode = async (req: Request, res: Response) => {
    const code = await ReferralService.createReferralCode(req.body);
    res.status(201).json({
      success: true,
      data: code,
    });
  };

  static getCustomerCode = async (req: Request, res: Response) => {
    const code = await ReferralService.getReferralCodeByCustomer(req.params.customerId);
    res.json({
      success: true,
      data: code,
    });
  };

  static recordReferral = async (req: Request, res: Response) => {
    const { code, referredId } = req.body;
    const referral = await ReferralService.recordReferral(code, referredId);
    res.json({
      success: true,
      data: referral,
    });
  };

  static updateStatus = async (req: Request, res: Response) => {
    const referral = await ReferralService.updateReferralStatus(req.params.id, req.body.status);
    res.json({
      success: true,
      data: referral,
    });
  };
}
