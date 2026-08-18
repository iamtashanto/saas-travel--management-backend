import { Request, Response } from 'express';
import { SegmentService } from './segment.service';
import { SegmentType } from '@prisma/client';

export class SegmentController {
  static listSegments = async (req: Request, res: Response) => {
    const { type, isActive } = req.query;

    const segments = await SegmentService.listSegments({
      type: type as SegmentType,
      isActive: isActive ? isActive === 'true' : undefined,
    });

    res.json({
      success: true,
      data: segments,
    });
  };

  static createSegment = async (req: Request, res: Response) => {
    const segment = await SegmentService.createSegment(req.body);
    res.status(201).json({
      success: true,
      data: segment,
    });
  };

  static getSegmentById = async (req: Request, res: Response) => {
    const segment = await SegmentService.getSegmentById(req.params.id);
    res.json({
      success: true,
      data: segment,
    });
  };

  static updateSegment = async (req: Request, res: Response) => {
    const segment = await SegmentService.updateSegment(req.params.id, req.body);
    res.json({
      success: true,
      data: segment,
    });
  };

  static addMembers = async (req: Request, res: Response) => {
    const result = await SegmentService.addMembers(req.params.id, req.body.customerIds, req.user?.id);
    res.json({
      success: true,
      message: `Added ${result.count} members`,
      data: result,
    });
  };

  static removeMembers = async (req: Request, res: Response) => {
    const result = await SegmentService.removeMembers(req.params.id, req.body.customerIds);
    res.json({
      success: true,
      message: `Removed ${result.count} members`,
      data: result,
    });
  };
}
