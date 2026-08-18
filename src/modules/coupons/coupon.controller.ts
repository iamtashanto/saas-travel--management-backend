import { Request, Response } from 'express';
import { CouponService } from './coupon.service';

export class CouponController {
  static listCoupons = async (req: Request, res: Response) => {
    const { isActive } = req.query;

    const coupons = await CouponService.listCoupons({
      isActive: isActive ? isActive === 'true' : undefined,
    });

    res.json({
      success: true,
      data: coupons,
    });
  };

  static createCoupon = async (req: Request, res: Response) => {
    const coupon = await CouponService.createCoupon(req.body);
    res.status(201).json({
      success: true,
      data: coupon,
    });
  };

  static validateCoupon = async (req: Request, res: Response) => {
    const { code, customerId, orderValue } = req.body;
    
    const result = await CouponService.validateCoupon(code, customerId, orderValue);

    res.json({
      success: true,
      data: {
        valid: result.valid,
        discountAmount: result.discountAmount,
        couponId: result.coupon.id,
      },
    });
  };
}
