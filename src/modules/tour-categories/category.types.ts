import { z } from 'zod';
import * as validation from './category.validation';

export type ListCategoriesQuery = z.infer<typeof validation.listCategoriesSchema>['query'];
export type CreateCategoryInput = z.infer<typeof validation.createCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof validation.updateCategorySchema>['body'];

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  sortOrder: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
