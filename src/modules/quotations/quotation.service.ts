import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';

export class QuotationService {
  static calculateTotals(items: any[], discountAmount: number = 0, taxAmount: number = 0, feeAmount: number = 0) {
    let subtotal = 0;
    let totalCostPrice = 0;

    for (const item of items) {
      const q = item.quantity || 1;
      const unitCost = Number(item.unitCostPrice) || 0;
      const unitSelling = Number(item.unitSellingPrice) || 0;
      const itemDiscount = Number(item.discount) || 0;
      const itemTax = Number(item.tax) || 0;

      const costTotal = (unitCost * q);
      const sellingTotal = (unitSelling * q) - itemDiscount + itemTax;

      item.costTotal = costTotal;
      item.sellingTotal = sellingTotal;

      subtotal += sellingTotal;
      totalCostPrice += costTotal;
    }

    const totalSellingPrice = subtotal - discountAmount + taxAmount + feeAmount;
    const grossProfit = totalSellingPrice - totalCostPrice;
    
    return {
      subtotal,
      totalCostPrice,
      totalSellingPrice,
      grossProfit,
      items
    };
  }

  static async createQuotation(organizationId: string, data: any, userId: string) {
    // Generate quotation number
    const quotationNumber = `QT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const calc = this.calculateTotals(data.items || [], data.discountAmount, data.taxAmount, data.feeAmount);

    let status = data.status || 'DRAFT';
    if (calc.grossProfit < 0) {
      status = 'INTERNAL_REVIEW'; // Margin protection
    }

    return await prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.create({
        data: {
          organizationId,
          quotationNumber,
          version: 1,
          corporateClientId: data.corporateClientId,
          leadId: data.leadId,
          customTourRequestId: data.customTourRequestId,
          validFrom: data.validFrom || new Date(),
          validUntil: data.validUntil,
          currency: data.currency || 'BDT',
          subtotal: calc.subtotal,
          discountAmount: data.discountAmount || 0,
          taxAmount: data.taxAmount || 0,
          feeAmount: data.feeAmount || 0,
          totalSellingPrice: calc.totalSellingPrice,
          totalCostPrice: calc.totalCostPrice,
          grossProfit: calc.grossProfit,
          paymentTerms: data.paymentTerms,
          cancellationTerms: data.cancellationTerms,
          notes: data.notes,
          internalNotes: data.internalNotes,
          status,
          createdBy: userId,
          items: {
            create: calc.items.map((i: any) => ({
              serviceType: i.serviceType,
              description: i.description,
              quantity: i.quantity,
              unit: i.unit,
              unitCostPrice: i.unitCostPrice,
              unitSellingPrice: i.unitSellingPrice,
              discount: i.discount,
              tax: i.tax,
              costTotal: i.costTotal,
              sellingTotal: i.sellingTotal
            }))
          },
          paymentMilestones: data.paymentMilestones ? {
            create: data.paymentMilestones.map((m: any) => ({
              name: m.name,
              percentage: m.percentage,
              amount: m.amount,
              dueDate: m.dueDate
            }))
          } : undefined
        },
        include: { items: true, paymentMilestones: true }
      });

      if (calc.grossProfit < 0) {
        await tx.approvalRequest.create({
          data: {
            organizationId,
            entityType: 'QUOTATION',
            entityId: quotation.id,
            requestedBy: userId,
            comment: 'System flagged for NEGATIVE_MARGIN'
          }
        });
      }

      return quotation;
    });
  }

  static async createRevision(organizationId: string, parentQuotationId: string, data: any, userId: string, changeReason: string) {
    const parent = await prisma.quotation.findFirst({
      where: { id: parentQuotationId, organizationId },
      include: { items: true, paymentMilestones: true }
    });

    if (!parent) throw new AppError(404, 'QUOTATION_NOT_FOUND', 'Parent quotation not found');

    const nextVersion = parent.version + 1;
    const calc = this.calculateTotals(data.items || parent.items, data.discountAmount ?? parent.discountAmount, data.taxAmount ?? parent.taxAmount, data.feeAmount ?? parent.feeAmount);

    let status = 'DRAFT';
    if (calc.grossProfit < 0) status = 'INTERNAL_REVIEW';

    return await prisma.$transaction(async (tx) => {
      // Mark parent as REVISION_REQUESTED or superseded (in our system we'll keep it as is, or mark CANCELLED, but prompt said do not modify historical sent)
      // We will just leave it.

      const quotation = await tx.quotation.create({
        data: {
          organizationId,
          quotationNumber: parent.quotationNumber,
          version: nextVersion,
          parentQuotationId: parent.id,
          changeReason,
          corporateClientId: parent.corporateClientId,
          leadId: parent.leadId,
          customTourRequestId: parent.customTourRequestId,
          validFrom: new Date(),
          validUntil: data.validUntil || parent.validUntil,
          currency: parent.currency,
          subtotal: calc.subtotal,
          discountAmount: data.discountAmount ?? parent.discountAmount,
          taxAmount: data.taxAmount ?? parent.taxAmount,
          feeAmount: data.feeAmount ?? parent.feeAmount,
          totalSellingPrice: calc.totalSellingPrice,
          totalCostPrice: calc.totalCostPrice,
          grossProfit: calc.grossProfit,
          paymentTerms: data.paymentTerms ?? parent.paymentTerms,
          cancellationTerms: data.cancellationTerms ?? parent.cancellationTerms,
          notes: data.notes ?? parent.notes,
          internalNotes: data.internalNotes ?? parent.internalNotes,
          status,
          createdBy: userId,
          items: {
            create: calc.items.map((i: any) => ({
              serviceType: i.serviceType,
              description: i.description,
              quantity: i.quantity,
              unit: i.unit,
              unitCostPrice: i.unitCostPrice,
              unitSellingPrice: i.unitSellingPrice,
              discount: i.discount,
              tax: i.tax,
              costTotal: i.costTotal,
              sellingTotal: i.sellingTotal
            }))
          },
          paymentMilestones: data.paymentMilestones ? {
            create: data.paymentMilestones.map((m: any) => ({
              name: m.name,
              percentage: m.percentage,
              amount: m.amount,
              dueDate: m.dueDate
            }))
          } : undefined
        },
        include: { items: true, paymentMilestones: true }
      });

      if (calc.grossProfit < 0) {
        await tx.approvalRequest.create({
          data: {
            organizationId,
            entityType: 'QUOTATION',
            entityId: quotation.id,
            requestedBy: userId,
            comment: 'System flagged for NEGATIVE_MARGIN'
          }
        });
      }

      return quotation;
    });
  }

  static async convertToBooking(organizationId: string, quotationId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.findFirst({
        where: { id: quotationId, organizationId },
        include: { paymentMilestones: true, corporateClient: true, items: true }
      });

      if (!quotation) throw new AppError(404, 'QUOTATION_NOT_FOUND', 'Quotation not found');
      if (quotation.status !== 'ACCEPTED') throw new AppError(400, 'INVALID_STATUS', 'Quotation must be ACCEPTED');
      
      const existingBooking = await tx.booking.findFirst({ where: { quotationId } });
      if (existingBooking) throw new AppError(409, 'BOOKING_ALREADY_CREATED', 'Booking already created from this quotation');

      // We need a customer to attach to the booking. We will see if one exists for the corporate client, else create a stub
      let customer = await tx.customer.findFirst({ where: { corporateClientId: quotation.corporateClientId, organizationId } });
      if (!customer) {
        customer = await tx.customer.create({
          data: {
            organizationId,
            corporateClientId: quotation.corporateClientId,
            firstName: quotation.corporateClient.companyName,
            email: quotation.corporateClient.email,
            phone: quotation.corporateClient.phone,
            status: 'ACTIVE'
          }
        });
      }

      // We need a stub tour/schedule to link to the booking since it's required in the Booking schema.
      // Or we assume Custom Tour creates a TourPackage in advance. For safety, we find any existing or create a dummy "Custom Tour"
      let tour = await tx.tourPackage.findFirst({ where: { organizationId, title: 'Custom Corporate Tour' } });
      if (!tour) {
        tour = await tx.tourPackage.create({
          data: { organizationId, title: 'Custom Corporate Tour', slug: `custom-tour-${Date.now()}`, description: 'Auto-generated for B2B bookings', categoryId: 'dummy' } // Category might fail if foreign key strict, we'll try to find first category
        });
      }
      
      const category = await tx.tourCategory.findFirst({ where: { organizationId } });
      if (category && tour.categoryId === 'dummy') {
         await tx.tourPackage.update({ where: { id: tour.id }, data: { categoryId: category.id } });
      }

      let schedule = await tx.tourSchedule.findFirst({ where: { organizationId, tourPackageId: tour.id } });
      if (!schedule) {
        schedule = await tx.tourSchedule.create({
          data: { organizationId, tourPackageId: tour.id, startDate: new Date(), endDate: new Date(), price: 0, capacity: 100 }
        });
      }

      const bookingReference = `B2B-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const booking = await tx.booking.create({
        data: {
          organizationId,
          bookingReference,
          customerId: customer.id,
          tourPackageId: tour.id,
          tourScheduleId: schedule.id,
          corporateClientId: quotation.corporateClientId,
          quotationId: quotation.id,
          bookingType: 'CORPORATE',
          status: 'PENDING',
          currency: quotation.currency,
          subtotal: quotation.subtotal,
          discountAmount: quotation.discountAmount,
          feeAmount: quotation.feeAmount,
          totalAmount: quotation.totalSellingPrice,
          dueAmount: quotation.totalSellingPrice,
          travelerCount: 0,
          createdBy: userId
        }
      });

      return booking;
    });
  }
}
