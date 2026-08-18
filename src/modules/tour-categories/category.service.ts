import { CategoryRepository } from './category.repository';
import { CreateCategoryInput, UpdateCategoryInput, ListCategoriesQuery } from './category.types';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/database';
import slugify from 'slugify';

export class CategoryService {
  static async listCategories(organizationId: string, query: ListCategoriesQuery) {
    return CategoryRepository.listCategories(organizationId, query);
  }

  static async getCategory(id: string, organizationId: string) {
    const category = await CategoryRepository.getCategoryById(id, organizationId);
    if (!category) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
    return category;
  }

  static async createCategory(organizationId: string, data: CreateCategoryInput, actorUserId: string) {
    let slug = data.slug;
    if (!slug) {
      slug = slugify(data.name!, { lower: true, strict: true });
    }

    const existing = await CategoryRepository.getCategoryBySlug(slug, organizationId);
    if (existing) {
      throw new AppError(409, 'CATEGORY_SLUG_EXISTS', 'Category with this slug already exists');
    }

    const category = await CategoryRepository.createCategory({
      ...data,
      slug,
      organization: { connect: { id: organizationId } }
    } as any);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'CATEGORY_CREATED',
        module: 'tourCategories',
        entityType: 'TourCategory',
        entityId: category.id,
      }
    });

    return category;
  }

  static async updateCategory(id: string, organizationId: string, data: UpdateCategoryInput, actorUserId: string) {
    const category = await this.getCategory(id, organizationId);

    if (data.slug && data.slug !== category.slug) {
      const existing = await CategoryRepository.getCategoryBySlug(data.slug, organizationId);
      if (existing) {
        throw new AppError(409, 'CATEGORY_SLUG_EXISTS', 'Category with this slug already exists');
      }
    }

    const updated = await CategoryRepository.updateCategory(id, data as any);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'CATEGORY_UPDATED',
        module: 'tourCategories',
        entityType: 'TourCategory',
        entityId: id,
        oldValues: { name: category.name, slug: category.slug, status: category.status } as any,
      }
    });

    return updated;
  }

  static async deleteCategory(id: string, organizationId: string, actorUserId: string) {
    await this.getCategory(id, organizationId);

    const tourCount = await CategoryRepository.countToursByCategory(id);
    
    if (tourCount > 0) {
      await CategoryRepository.archiveCategory(id);
      
      await prisma.auditLog.create({
        data: {
          organizationId,
          userId: actorUserId,
          action: 'CATEGORY_ARCHIVED',
          module: 'tourCategories',
          entityType: 'TourCategory',
          entityId: id,
          metadata: { reason: 'CATEGORY_IN_USE' } as any,
        }
      });
      return { archived: true };
    }

    await CategoryRepository.deleteCategory(id);

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: actorUserId,
        action: 'CATEGORY_DELETED',
        module: 'tourCategories',
        entityType: 'TourCategory',
        entityId: id,
      }
    });
    
    return { archived: false };
  }
}
