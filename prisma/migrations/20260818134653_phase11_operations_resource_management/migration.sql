-- CreateEnum
CREATE TYPE "TourReadinessStatus" AS ENUM ('NOT_READY', 'PARTIALLY_READY', 'READY', 'CRITICAL');

-- CreateEnum
CREATE TYPE "StaffShiftStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PurchaseRequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "GoodsReceiptStatus" AS ENUM ('DRAFT', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('PURCHASE', 'RECEIVE', 'ISSUE', 'TRANSFER', 'RETURN', 'ADJUSTMENT', 'WASTE', 'DAMAGE');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('GOOD', 'MINOR_DAMAGE', 'DAMAGED', 'LOST', 'UNDER_REPAIR');

-- AlterTable
ALTER TABLE "hotels" ADD COLUMN     "checkInTime" TEXT,
ADD COLUMN     "checkOutTime" TEXT;

-- AlterTable
ALTER TABLE "tour_incidents" ADD COLUMN     "actualCost" DECIMAL(12,2),
ADD COLUMN     "estimatedCost" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "tour_operations" ADD COLUMN     "readinessPercentage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "readinessStatus" "TourReadinessStatus" NOT NULL DEFAULT 'NOT_READY';

-- AlterTable
ALTER TABLE "vehicle_maintenance" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "fuelType" TEXT,
ADD COLUMN     "ownerType" TEXT NOT NULL DEFAULT 'COMPANY';

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "tourScheduleId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_bills" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "vendorId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "date" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "referenceId" UUID,
    "referenceType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_templates" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "ChecklistCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_template_items" (
    "id" UUID NOT NULL,
    "checklistTemplateId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "checklist_template_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_emergency_contacts" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tourScheduleId" UUID NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tour_emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_documents" (
    "id" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentNumber" TEXT,
    "issueDate" DATE,
    "expiryDate" DATE,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_trip_logs" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "tourScheduleId" UUID,
    "driverId" UUID,
    "tripStart" TIMESTAMP(3) NOT NULL,
    "tripEnd" TIMESTAMP(3),
    "startOdometer" INTEGER,
    "endOdometer" INTEGER,
    "fuelConsumed" DECIMAL(10,2),
    "route" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_trip_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_fuel_records" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "vendorId" UUID,
    "date" TIMESTAMP(3) NOT NULL,
    "liters" DECIMAL(10,2) NOT NULL,
    "pricePerLiter" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(12,2) NOT NULL,
    "odometer" INTEGER,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_fuel_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_rentals" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "vendorId" UUID NOT NULL,
    "rentalStart" TIMESTAMP(3) NOT NULL,
    "rentalEnd" TIMESTAMP(3) NOT NULL,
    "rate" DECIMAL(12,2) NOT NULL,
    "deposit" DECIMAL(12,2),
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_rentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_duty_logs" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "driverId" UUID NOT NULL,
    "tourScheduleId" UUID,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "startOdometer" INTEGER,
    "endOdometer" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_duty_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_shifts" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "staffId" UUID NOT NULL,
    "tourScheduleId" UUID,
    "date" DATE NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "status" "StaffShiftStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requests" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "requestedBy" UUID NOT NULL,
    "department" TEXT,
    "requiredDate" DATE,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "reason" TEXT,
    "status" "PurchaseRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_request_items" (
    "id" UUID NOT NULL,
    "purchaseRequestId" UUID NOT NULL,
    "tourScheduleId" UUID,
    "category" TEXT,
    "item" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "estimatedUnitCost" DECIMAL(12,2),
    "estimatedTotal" DECIMAL(12,2),

    CONSTRAINT "purchase_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "poNumber" TEXT NOT NULL,
    "vendorId" UUID NOT NULL,
    "orderDate" DATE NOT NULL,
    "expectedDate" DATE,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" UUID NOT NULL,
    "purchaseOrderId" UUID NOT NULL,
    "tourScheduleId" UUID,
    "inventoryItemId" UUID,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipts" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "purchaseOrderId" UUID NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "receivedBy" UUID NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "GoodsReceiptStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goods_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipt_items" (
    "id" UUID NOT NULL,
    "goodsReceiptId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "orderedQty" DECIMAL(10,2) NOT NULL,
    "receivedQty" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "rejectedQty" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "acceptedQty" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "goods_receipt_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_locations" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "itemCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "description" TEXT,
    "minimumStock" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "maximumStock" DECIMAL(10,2),
    "reorderPoint" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "costMethod" TEXT NOT NULL DEFAULT 'AVERAGE_COST',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_levels" (
    "id" UUID NOT NULL,
    "inventoryItemId" UUID NOT NULL,
    "locationId" UUID NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "inventoryItemId" UUID NOT NULL,
    "fromLocationId" UUID,
    "toLocationId" UUID,
    "quantity" DECIMAL(10,2) NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "referenceType" TEXT,
    "referenceId" UUID,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'GOOD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_assignments" (
    "id" UUID NOT NULL,
    "equipmentId" UUID NOT NULL,
    "tourScheduleId" UUID,
    "staffId" UUID,
    "vehicleId" UUID,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),
    "condition" "EquipmentStatus" NOT NULL DEFAULT 'GOOD',
    "notes" TEXT,

    CONSTRAINT "equipment_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vendors_organizationId_idx" ON "vendors"("organizationId");

-- CreateIndex
CREATE INDEX "expenses_organizationId_idx" ON "expenses"("organizationId");

-- CreateIndex
CREATE INDEX "vendor_bills_organizationId_vendorId_idx" ON "vendor_bills"("organizationId", "vendorId");

-- CreateIndex
CREATE INDEX "tour_emergency_contacts_tourScheduleId_idx" ON "tour_emergency_contacts"("tourScheduleId");

-- CreateIndex
CREATE INDEX "vehicle_documents_vehicleId_idx" ON "vehicle_documents"("vehicleId");

-- CreateIndex
CREATE INDEX "vehicle_trip_logs_vehicleId_idx" ON "vehicle_trip_logs"("vehicleId");

-- CreateIndex
CREATE INDEX "vehicle_fuel_records_vehicleId_idx" ON "vehicle_fuel_records"("vehicleId");

-- CreateIndex
CREATE INDEX "driver_duty_logs_driverId_idx" ON "driver_duty_logs"("driverId");

-- CreateIndex
CREATE INDEX "staff_shifts_staffId_idx" ON "staff_shifts"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_requests_organizationId_requestNumber_key" ON "purchase_requests"("organizationId", "requestNumber");

-- CreateIndex
CREATE INDEX "purchase_orders_organizationId_vendorId_idx" ON "purchase_orders"("organizationId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_organizationId_poNumber_key" ON "purchase_orders"("organizationId", "poNumber");

-- CreateIndex
CREATE UNIQUE INDEX "goods_receipts_organizationId_receiptNumber_key" ON "goods_receipts"("organizationId", "receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_organizationId_itemCode_key" ON "inventory_items"("organizationId", "itemCode");

-- CreateIndex
CREATE UNIQUE INDEX "stock_levels_inventoryItemId_locationId_key" ON "stock_levels"("inventoryItemId", "locationId");

-- CreateIndex
CREATE INDEX "stock_movements_inventoryItemId_idx" ON "stock_movements"("inventoryItemId");

-- CreateIndex
CREATE INDEX "equipment_assignments_equipmentId_idx" ON "equipment_assignments"("equipmentId");

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bills" ADD CONSTRAINT "vendor_bills_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_bills" ADD CONSTRAINT "vendor_bills_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_template_items" ADD CONSTRAINT "checklist_template_items_checklistTemplateId_fkey" FOREIGN KEY ("checklistTemplateId") REFERENCES "checklist_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_emergency_contacts" ADD CONSTRAINT "tour_emergency_contacts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_emergency_contacts" ADD CONSTRAINT "tour_emergency_contacts_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "tour_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_documents" ADD CONSTRAINT "vehicle_documents_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_trip_logs" ADD CONSTRAINT "vehicle_trip_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_trip_logs" ADD CONSTRAINT "vehicle_trip_logs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_trip_logs" ADD CONSTRAINT "vehicle_trip_logs_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "tour_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_trip_logs" ADD CONSTRAINT "vehicle_trip_logs_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_fuel_records" ADD CONSTRAINT "vehicle_fuel_records_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_fuel_records" ADD CONSTRAINT "vehicle_fuel_records_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_fuel_records" ADD CONSTRAINT "vehicle_fuel_records_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_rentals" ADD CONSTRAINT "vehicle_rentals_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_rentals" ADD CONSTRAINT "vehicle_rentals_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_rentals" ADD CONSTRAINT "vehicle_rentals_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_duty_logs" ADD CONSTRAINT "driver_duty_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_duty_logs" ADD CONSTRAINT "driver_duty_logs_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_duty_logs" ADD CONSTRAINT "driver_duty_logs_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "tour_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_shifts" ADD CONSTRAINT "staff_shifts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_shifts" ADD CONSTRAINT "staff_shifts_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_shifts" ADD CONSTRAINT "staff_shifts_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "tour_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_purchaseRequestId_fkey" FOREIGN KEY ("purchaseRequestId") REFERENCES "purchase_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "tour_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "tour_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_receivedBy_fkey" FOREIGN KEY ("receivedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_goodsReceiptId_fkey" FOREIGN KEY ("goodsReceiptId") REFERENCES "goods_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_locations" ADD CONSTRAINT "inventory_locations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "inventory_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "inventory_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "inventory_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_assignments" ADD CONSTRAINT "equipment_assignments_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_assignments" ADD CONSTRAINT "equipment_assignments_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "tour_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_assignments" ADD CONSTRAINT "equipment_assignments_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_assignments" ADD CONSTRAINT "equipment_assignments_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
