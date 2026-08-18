import { Request, Response } from 'express';
import { AutomationService } from './automation.service';

export class AutomationController {
  static listRules = async (req: Request, res: Response) => {
    const { isActive } = req.query;

    const rules = await AutomationService.listRules({
      isActive: isActive ? isActive === 'true' : undefined,
    });

    res.json({
      success: true,
      data: rules,
    });
  };

  static createRule = async (req: Request, res: Response) => {
    const rule = await AutomationService.createRule(req.body);
    res.status(201).json({
      success: true,
      data: rule,
    });
  };

  static getRuleById = async (req: Request, res: Response) => {
    const rule = await AutomationService.getRuleById(req.params.id);
    res.json({
      success: true,
      data: rule,
    });
  };

  static updateRule = async (req: Request, res: Response) => {
    const rule = await AutomationService.updateRule(req.params.id, req.body);
    res.json({
      success: true,
      data: rule,
    });
  };
}
