import { z } from 'zod';
import * as validation from './staff.validation';

export type ListStaffQuery = z.infer<typeof validation.listStaffSchema>['query'];
export type InviteStaffInput = z.infer<typeof validation.inviteStaffSchema>['body'];
export type UpdateStaffInput = z.infer<typeof validation.updateStaffSchema>['body'];
export type UpdateStaffStatusInput = z.infer<typeof validation.updateStaffStatusSchema>['body'];
export type UpdateStaffRolesInput = z.infer<typeof validation.updateStaffRolesSchema>['body'];

export interface StaffResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  roles: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export interface InvitationResponse {
  id: string;
  email: string;
  roleIds: string[];
  expiresAt: Date;
  acceptedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
}
