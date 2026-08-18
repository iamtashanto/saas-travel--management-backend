import { z } from 'zod';
import * as validation from './role.validation';

export type CreateRoleInput = z.infer<typeof validation.createRoleSchema>['body'];
export type UpdateRoleInput = z.infer<typeof validation.updateRoleSchema>['body'];
export type AssignPermissionsInput = z.infer<typeof validation.assignPermissionsSchema>['body'];

export interface RoleResponse {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions?: string[];
}
