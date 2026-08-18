import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';

export class ProcurementService {
  // ---- PURCHASE REQUESTS ----

  static async createPurchaseRequest(organizationId: string, userId: string, data: any) {
    const requestNumber = `PR-${Date.now().toString().slice(-6)}`;
    
    return prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.create({
        data: {
          organizationId,
          requestNumber,
          requestedBy: userId,
          department: data.department,
          requiredDate: data.requiredDate ? new Date(data.requiredDate) : null,
          priority: data.priority,
          reason: data.reason,
          items: {
            create: data.items.map((item: any) => ({
              ...item,
              estimatedTotal: item.estimatedUnitCost ? item.quantity * item.estimatedUnitCost : null
            }))
          }
        },
        include: { items: true }
      });
      return pr;
    });
  }

  static async listPurchaseRequests(organizationId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.purchaseRequest.findMany({
        where: { organizationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.purchaseRequest.count({ where: { organizationId } })
    ]);
    return { data, total, page, limit };
  }

  static async getPurchaseRequest(id: string, organizationId: string) {
    const pr = await prisma.purchaseRequest.findFirst({
      where: { id, organizationId },
      include: { items: true, user: { select: { name: true, email: true } } }
    });
    if (!pr) throw new AppError(404, 'NOT_FOUND', 'Purchase Request not found');
    return pr;
  }

  static async updatePurchaseRequestStatus(id: string, organizationId: string, status: any) {
    const pr = await this.getPurchaseRequest(id, organizationId);
    return prisma.purchaseRequest.update({
      where: { id },
      data: { status }
    });
  }

  // ---- PURCHASE ORDERS ----

  static async createPurchaseOrder(organizationId: string, data: any) {
    const poNumber = `PO-${Date.now().toString().slice(-6)}`;
    
    return prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const items = data.items.map((item: any) => {
        const lineTotal = (item.quantity * item.unitPrice) + (item.tax || 0) - (item.discount || 0);
        subtotal += lineTotal;
        return { ...item, total: lineTotal };
      });

      const total = subtotal + (data.tax || 0) - (data.discount || 0);

      const po = await tx.purchaseOrder.create({
        data: {
          organizationId,
          poNumber,
          vendorId: data.vendorId,
          orderDate: new Date(data.orderDate),
          expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
          tax: data.tax || 0,
          discount: data.discount || 0,
          subtotal,
          total,
          notes: data.notes,
          items: {
            create: items
          }
        },
        include: { items: true }
      });
      return po;
    });
  }

  static async listPurchaseOrders(organizationId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where: { organizationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.purchaseOrder.count({ where: { organizationId } })
    ]);
    return { data, total, page, limit };
  }

  static async getPurchaseOrder(id: string, organizationId: string) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id, organizationId },
      include: { items: true, vendor: true }
    });
    if (!po) throw new AppError(404, 'NOT_FOUND', 'Purchase Order not found');
    return po;
  }

  // ---- GOODS RECEIPTS ----

  static async createGoodsReceipt(organizationId: string, userId: string, data: any) {
    const receiptNumber = `GR-${Date.now().toString().slice(-6)}`;

    return prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findFirst({ where: { id: data.purchaseOrderId, organizationId } });
      if (!po) throw new AppError(404, 'NOT_FOUND', 'Purchase Order not found');

      const gr = await tx.goodsReceipt.create({
        data: {
          organizationId,
          receiptNumber,
          purchaseOrderId: data.purchaseOrderId,
          receivedBy: userId,
          notes: data.notes,
          items: {
            create: data.items
          }
        },
        include: { items: true }
      });

      // Update PO status
      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: 'RECEIVED' }
      });

      // If items match inventory items, we should ideally trigger stock movement.
      // Handled in Inventory module separately or via events.

      return gr;
    });
  }

  static async getGoodsReceipt(id: string, organizationId: string) {
    const gr = await prisma.goodsReceipt.findFirst({
      where: { id, organizationId },
      include: { items: true, purchaseOrder: true }
    });
    if (!gr) throw new AppError(404, 'NOT_FOUND', 'Goods Receipt not found');
    return gr;
  }
}
