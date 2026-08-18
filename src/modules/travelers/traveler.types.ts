import { z } from 'zod';
import * as validation from './traveler.validation';

export type ListTravelersQuery = z.infer<typeof validation.listTravelersSchema>['query'];
export type CreateTravelerInput = z.infer<typeof validation.createTravelerSchema>['body'];
export type UpdateTravelerInput = z.infer<typeof validation.updateTravelerSchema>['body'];
