import { z } from 'zod';
import * as validation from './tour.validation';

export type ListToursQuery = z.infer<typeof validation.listToursSchema>['query'];
export type CreateTourInput = z.infer<typeof validation.createTourSchema>['body'];
export type UpdateTourInput = z.infer<typeof validation.updateTourSchema>['body'];

export interface TourResponse {
  id: string;
  title: string;
  slug: string;
  destinationId: string;
  categoryId: string;
  status: string;
  basePrice: number;
  createdAt: Date;
}
