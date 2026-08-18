import { z } from 'zod';
import * as validation from './organization.validation';

export type UpdateOrganizationInput = z.infer<typeof validation.updateOrganizationSchema>['body'];
export type UpdateOrganizationSettingsInput = z.infer<typeof validation.updateOrganizationSettingsSchema>['body'];

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  legalName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  defaultCurrency: string;
  timezone: string;
  countryCode: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
