import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { AppError } from '../../utils/app-error';
import { z } from 'zod';

export const corporateContactSchema = z.object({
  name: z.string().min(1),
  designation: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(['TRAVEL_COORDINATOR', 'HR', 'ADMIN', 'FINANCE', 'MANAGER', 'OTHER']).optional(),
  isPrimary: z.boolean().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

export class CorporateContactController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId } = req.params;
      const organizationId = req.tenant!.organizationId;

      const contacts = await prisma.corporateContact.findMany({
        where: { corporateClientId: clientId, corporateClient: { organizationId } },
        orderBy: { isPrimary: 'desc' }
      });

      sendResponse(res, 200, true, 'Corporate contacts retrieved', contacts);
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId } = req.params;
      const organizationId = req.tenant!.organizationId;
      const data = req.body;

      const client = await prisma.corporateClient.findFirst({ where: { id: clientId, organizationId } });
      if (!client) throw new AppError(404, 'CORPORATE_CLIENT_NOT_FOUND', 'Client not found');

      // If this is primary, unset others
      if (data.isPrimary) {
        await prisma.corporateContact.updateMany({
          where: { corporateClientId: clientId },
          data: { isPrimary: false }
        });
      }

      const contact = await prisma.corporateContact.create({
        data: { ...data, corporateClientId: clientId }
      });

      sendResponse(res, 201, true, 'Corporate contact created', contact);
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId, contactId } = req.params;
      const organizationId = req.tenant!.organizationId;
      const data = req.body;

      const contact = await prisma.corporateContact.findFirst({
        where: { id: contactId, corporateClientId: clientId, corporateClient: { organizationId } }
      });
      if (!contact) throw new AppError(404, 'NOT_FOUND', 'Contact not found');

      if (data.isPrimary) {
        await prisma.corporateContact.updateMany({
          where: { corporateClientId: clientId },
          data: { isPrimary: false }
        });
      }

      const updated = await prisma.corporateContact.update({
        where: { id: contactId },
        data
      });

      sendResponse(res, 200, true, 'Corporate contact updated', updated);
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId, contactId } = req.params;
      const organizationId = req.tenant!.organizationId;

      const contact = await prisma.corporateContact.findFirst({
        where: { id: contactId, corporateClientId: clientId, corporateClient: { organizationId } }
      });
      if (!contact) throw new AppError(404, 'NOT_FOUND', 'Contact not found');

      await prisma.corporateContact.delete({ where: { id: contactId } });

      sendResponse(res, 200, true, 'Corporate contact deleted');
    } catch (error) { next(error); }
  }
}
