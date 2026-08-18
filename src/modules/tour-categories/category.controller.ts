import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { CategoryService } from './category.service';
import { AppError } from '../../common/errors/AppError';

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const result = await CategoryService.listCategories(req.auth.organizationId, req.query as any);
  res.status(200).json({ success: true, data: result, message: 'Categories retrieved' });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const category = await CategoryService.getCategory(req.params.id, req.auth.organizationId);
  res.status(200).json({ success: true, data: category, message: 'Category retrieved' });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const category = await CategoryService.createCategory(req.auth.organizationId, req.body, req.auth.userId);
  res.status(201).json({ success: true, data: category, message: 'Category created' });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const category = await CategoryService.updateCategory(req.params.id, req.auth.organizationId, req.body, req.auth.userId);
  res.status(200).json({ success: true, data: category, message: 'Category updated' });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new AppError(401, 'UNAUTHORIZED', 'Missing auth context');
  const result = await CategoryService.deleteCategory(req.params.id, req.auth.organizationId, req.auth.userId);
  
  if (result.archived) {
    res.status(200).json({ success: true, data: {}, message: 'Category is in use and has been archived instead of deleted' });
  } else {
    res.status(200).json({ success: true, data: {}, message: 'Category deleted' });
  }
});
