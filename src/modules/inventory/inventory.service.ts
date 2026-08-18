import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';

export class InventoryService {
  // ---- LOCATIONS ----

  static async createLocation(organizationId: string, data: any) {
    return prisma.inventoryLocation.create({
      data: { ...data, organizationId }
    });
  }

  static async listLocations(organizationId: string) {
    return prisma.inventoryLocation.findMany({
      where: { organizationId, isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  // ---- ITEMS ----

  static async createItem(organizationId: string, data: any) {
    const existing = await prisma.inventoryItem.findUnique({
      where: { organizationId_itemCode: { organizationId, itemCode: data.itemCode } }
    });
    if (existing) throw new AppError(400, 'DUPLICATE_ITEM_CODE', 'Item code already exists');

    return prisma.inventoryItem.create({
      data: { ...data, organizationId }
    });
  }

  static async listItems(organizationId: string, page: number, limit: number, category?: string) {
    const skip = (page - 1) * limit;
    const where: any = { organizationId, isActive: true };
    if (category) where.category = category;

    const [data, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where, skip, take: limit,
        include: { stocks: { include: { location: true } } },
        orderBy: { name: 'asc' }
      }),
      prisma.inventoryItem.count({ where })
    ]);
    return { data, total, page, limit };
  }

  static async getItem(id: string, organizationId: string) {
    const item = await prisma.inventoryItem.findFirst({
      where: { id, organizationId },
      include: {
        stocks: { include: { location: true } },
        movements: { orderBy: { createdAt: 'desc' }, take: 20 }
      }
    });
    if (!item) throw new AppError(404, 'NOT_FOUND', 'Inventory item not found');
    return item;
  }

  // ---- STOCK MOVEMENTS ----

  static async recordMovement(organizationId: string, userId: string, data: any) {
    return prisma.$transaction(async (tx) => {
      // 1. Create movement record
      const movement = await tx.stockMovement.create({
        data: {
          ...data,
          organizationId,
          createdBy: userId
        }
      });

      // 2. Deduct from source location (if not a pure receipt)
      if (data.fromLocationId && ['ISSUE', 'TRANSFER', 'WASTE', 'DAMAGE', 'ADJUSTMENT'].includes(data.type)) {
        const fromStock = await tx.stockLevel.findUnique({
          where: { inventoryItemId_locationId: { inventoryItemId: data.inventoryItemId, locationId: data.fromLocationId } }
        });
        
        if (!fromStock || Number(fromStock.quantity) < data.quantity) {
          throw new AppError(400, 'INSUFFICIENT_STOCK', 'Not enough stock in source location');
        }

        await tx.stockLevel.update({
          where: { id: fromStock.id },
          data: { quantity: { decrement: data.quantity } }
        });
      }

      // 3. Add to destination location (if receiving or transferring)
      if (data.toLocationId && ['RECEIVE', 'TRANSFER', 'RETURN', 'ADJUSTMENT'].includes(data.type)) {
        await tx.stockLevel.upsert({
          where: { inventoryItemId_locationId: { inventoryItemId: data.inventoryItemId, locationId: data.toLocationId } },
          update: { quantity: { increment: data.quantity } },
          create: {
            inventoryItemId: data.inventoryItemId,
            locationId: data.toLocationId,
            quantity: data.quantity
          }
        });
      }

      return movement;
    });
  }
}
