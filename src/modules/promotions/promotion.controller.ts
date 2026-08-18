import { Request, Response } from 'express';
import { PromotionService } from './promotion.service';
import { CategoryStatus } from '@prisma/client';

export class PromotionController {
  static listPromotions = async (req: Request, res: Response) => {
    const { status, isFeatured } = req.query;

    const promotions = await PromotionService.listPromotions({
      status: status as CategoryStatus,
      isFeatured: isFeatured ? isFeatured === 'true' : undefined,
    });

    res.json({
      success: true,
      data: promotions,
    });
  };

  static createPromotion = async (req: Request, res: Response) => {
    const promotion = await PromotionService.createPromotion(req.body);
    res.status(201).json({
      success: true,
      data: promotion,
    });
  };

  static updatePromotion = async (req: Request, res: Response) => {
    const promotion = await PromotionService.updatePromotion(req.params.id, req.body);
    res.json({
      success: true,
      data: promotion,
    });
  };
}
