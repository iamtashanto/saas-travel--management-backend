import { z } from 'zod';
import * as validation from './destination.validation';

export type ListDestinationsQuery = z.infer<typeof validation.listDestinationsSchema>['query'];
export type CreateDestinationInput = z.infer<typeof validation.createDestinationSchema>['body'];
export type UpdateDestinationInput = z.infer<typeof validation.updateDestinationSchema>['body'];

export interface DestinationResponse {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  country: string | null;
  division: string | null;
  district: string | null;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  coverImageUrl: string | null;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}
