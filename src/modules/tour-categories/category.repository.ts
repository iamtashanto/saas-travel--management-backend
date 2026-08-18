import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { ListCategoriesQuery } from './category.types';

export class CategoryRepository {
  static async listCategories(organizationId: string, query: ListCategoriesQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.TourCategoryWhereInput = {
      organizationId,
    };

    if (query.status) where.status = query.status;

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [total, items] = await Promise.all([
      prisma.tourCategory.count({ where }),
      prisma.tourCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sort || 'sortOrder']: query.order || 'asc' },
      })
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  static async getCategoryById(id: string, organizationId: string) {
    return prisma.tourCategory.findFirst({
      where: { id, organizationId }
    });
  }

  static async getCategoryBySlug(slug: string, organizationId: string) {
    return prisma.tourCategory.findUnique({
      where: { organizationId_slug: { organizationId, slug } }
    });
  }

  static async createCategory(data: Prisma.TourCategoryCreateInput) {
    return prisma.tourCategory.create({ data });
  }

  static async updateCategory(id: string, data: Prisma.TourCategoryUpdateInput) {
    return prisma.tourCategory.update({
      where: { id },
      data
    });
  }

  static async countToursByCategory(id: string) {
    return prisma.tourPackage.count({
      where: { categoryId: id }
    });
  }

  static async archiveCategory(id: string) {
    return prisma.tourCategory.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });
  }

  static async deleteCategory(id: string) {
    return prisma.tourCategory.delete({
      where: { id }
    });
  }
}
