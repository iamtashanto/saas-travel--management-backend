import { Request, Response } from 'express';
import { CampaignService } from './campaign.service';
import { CampaignType, CampaignStatus } from '@prisma/client';

export class CampaignController {
  static listCampaigns = async (req: Request, res: Response) => {
    const { type, status } = req.query;

    const campaigns = await CampaignService.listCampaigns({
      type: type as CampaignType,
      status: status as CampaignStatus,
    });

    res.json({
      success: true,
      data: campaigns,
    });
  };

  static createCampaign = async (req: Request, res: Response) => {
    const campaign = await CampaignService.createCampaign({
      ...req.body,
      createdBy: req.user?.id,
    });
    res.status(201).json({
      success: true,
      data: campaign,
    });
  };

  static getCampaignById = async (req: Request, res: Response) => {
    const campaign = await CampaignService.getCampaignById(req.params.id);
    res.json({
      success: true,
      data: campaign,
    });
  };

  static updateCampaign = async (req: Request, res: Response) => {
    const campaign = await CampaignService.updateCampaign(req.params.id, req.body);
    res.json({
      success: true,
      data: campaign,
    });
  };

  static addRecipients = async (req: Request, res: Response) => {
    const result = await CampaignService.addRecipients(req.params.id, req.body.customerIds, req.body.channel);
    res.json({
      success: true,
      message: `Added ${result.count} recipients`,
      data: result,
    });
  };
}
