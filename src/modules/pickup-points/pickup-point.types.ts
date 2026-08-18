import { z } from 'zod';
import * as validation from './pickup-point.validation';

export type ListPickupPointsQuery = z.infer<typeof validation.listPickupPointsSchema>['query'];
export type CreatePickupPointInput = z.infer<typeof validation.createPickupPointSchema>['body'];
export type UpdatePickupPointInput = z.infer<typeof validation.updatePickupPointSchema>['body'];

export interface PickupPointResponse {
  id: string;
  name: string;
  address: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  defaultPickupTime: string | null;
  contactName: string | null;
  contactPhone: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
