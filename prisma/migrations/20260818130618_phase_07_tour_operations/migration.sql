-- CreateEnum
CREATE TYPE "TourOperationStatus" AS ENUM ('DRAFT', 'PREPARING', 'READY', 'DEPARTED', 'IN_PROGRESS', 'RETURNING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TravelerOperationalStatus" AS ENUM ('BOOKED', 'CONFIRMED', 'CHECKED_IN', 'NO_SHOW', 'BOARDED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ChecklistCategory" AS ENUM ('TRANSPORT', 'TRAVELERS', 'HOTEL', 'GUIDE', 'FINANCE', 'DOCUMENTS', 'SAFETY', 'GENERAL');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('BUS', 'MICROBUS', 'CAR', 'BOAT', 'LAUNCH', 'OTHER');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'ON_LEAVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "GuideRole" AS ENUM ('LEAD_GUIDE', 'ASSISTANT_GUIDE', 'LOCAL_GUIDE');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('MEDICAL', 'TRANSPORT', 'TRAVELER', 'HOTEL', 'WEATHER', 'SAFETY', 'SECURITY', 'FINANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "NoteVisibility" AS ENUM ('INTERNAL', 'STAFF', 'MANAGER_ONLY');

-- AlterTable
ALTER TABLE "booking_travelers" ADD COLUMN     "boardedAt" TIMESTAMP(3),
ADD COLUMN     "boardedBy" UUID,
ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "checkedInBy" UUID,
ADD COLUMN     "operationalStatus" "TravelerOperationalStatus" NOT NULL DEFAULT 'BOOKED';

-- CreateTable
CREATE TABLE "tour_operations" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tourScheduleId" UUID NOT NULL,
    "operationCode" TEXT NOT NULL,
    "status" "TourOperationStatus" NOT NULL DEFAULT 'DRAFT',
    "plannedDepartureAt" TIMESTAMP(3),
    "actualDepartureAt" TIMESTAMP(3),
    "plannedReturnAt" TIMESTAMP(3),
    "actualReturnAt" TIMESTAMP(3),
    "departureLocation" TEXT,
    "returnLocation" TEXT,
    "totalTravelers" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,

    CONSTRAINT "tour_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_checklists" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tourOperationId" UUID NOT NULL,
    "category" "ChecklistCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operational_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_checklist_items" (
    "id" UUID NOT NULL,
    "checklistId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "completedBy" UUID,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "operational_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manifest_versions" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tourScheduleId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" UUID,
    "dataSnapshot" JSONB,

    CONSTRAINT "manifest_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "ResourceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "brand" TEXT,
    "model" TEXT,
    "color" TEXT,
    "manufactureYear" INTEGER,
    "currentMileage" INTEGER,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_maintenance" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "maintenanceType" TEXT NOT NULL,
    "description" TEXT,
    "cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL,
    "nextMaintenanceDate" TIMESTAMP(3),
    "odometer" INTEGER,
    "vendor" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "licenseNumber" TEXT NOT NULL,
    "licenseType" TEXT,
    "licenseExpiryDate" TIMESTAMP(3) NOT NULL,
    "experienceYears" INTEGER,
    "address" TEXT,
    "emergencyContact" TEXT,
    "status" "ResourceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_transport_assignments" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tourScheduleId" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "driverId" UUID,
    "helperId" UUID,
    "departureAt" TIMESTAMP(3),
    "returnAt" TIMESTAMP(3),
    "pickupNotes" TEXT,
    "seatCapacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_transport_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotels" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "contactPerson" TEXT,
    "rating" INTEGER,
    "website" TEXT,
    "notes" TEXT,
    "status" "ResourceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_room_types" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "hotelId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "totalRooms" INTEGER NOT NULL DEFAULT 0,
    "availableRooms" INTEGER NOT NULL DEFAULT 0,
    "basePrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_room_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_hotel_assignments" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tourScheduleId" UUID NOT NULL,
    "hotelId" UUID NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_hotel_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_allocations" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "assignmentId" UUID NOT NULL,
    "roomTypeId" UUID NOT NULL,
    "roomId" TEXT,
    "capacity" INTEGER NOT NULL,
    "allocatedCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ALLOCATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_guides" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "experienceYears" INTEGER,
    "languages" TEXT[],
    "specialization" TEXT,
    "emergencyContact" TEXT,
    "photoUrl" TEXT,
    "status" "ResourceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_guide_assignments" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tourScheduleId" UUID NOT NULL,
    "guideId" UUID NOT NULL,
    "role" "GuideRole" NOT NULL DEFAULT 'LOCAL_GUIDE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_guide_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_incidents" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tourScheduleId" UUID NOT NULL,
    "tourOperationId" UUID,
    "type" "IncidentType" NOT NULL,
    "severity" "IncidentSeverity" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportedBy" UUID,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_operation_notes" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tourOperationId" UUID NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "visibility" "NoteVisibility" NOT NULL DEFAULT 'INTERNAL',
    "authorId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_operation_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tour_operations_tourScheduleId_key" ON "tour_operations"("tourScheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "tour_operations_operationCode_key" ON "tour_operations"("operationCode");

-- CreateIndex
CREATE INDEX "tour_operations_organizationId_status_idx" ON "tour_operations"("organizationId", "status");

-- CreateIndex
CREATE INDEX "operational_checklists_tourOperationId_idx" ON "operational_checklists"("tourOperationId");

-- CreateIndex
CREATE INDEX "operational_checklist_items_checklistId_idx" ON "operational_checklist_items"("checklistId");

-- CreateIndex
CREATE UNIQUE INDEX "manifest_versions_tourScheduleId_version_key" ON "manifest_versions"("tourScheduleId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_organizationId_registrationNumber_key" ON "vehicles"("organizationId", "registrationNumber");

-- CreateIndex
CREATE INDEX "vehicle_maintenance_vehicleId_idx" ON "vehicle_maintenance"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_organizationId_licenseNumber_key" ON "drivers"("organizationId", "licenseNumber");

-- CreateIndex
CREATE INDEX "tour_transport_assignments_tourScheduleId_idx" ON "tour_transport_assignments"("tourScheduleId");

-- CreateIndex
CREATE INDEX "tour_transport_assignments_vehicleId_idx" ON "tour_transport_assignments"("vehicleId");

-- CreateIndex
CREATE INDEX "tour_transport_assignments_driverId_idx" ON "tour_transport_assignments"("driverId");

-- CreateIndex
CREATE INDEX "hotels_organizationId_city_idx" ON "hotels"("organizationId", "city");

-- CreateIndex
CREATE INDEX "tour_hotel_assignments_tourScheduleId_idx" ON "tour_hotel_assignments"("tourScheduleId");

-- CreateIndex
CREATE INDEX "room_allocations_assignmentId_idx" ON "room_allocations"("assignmentId");

-- CreateIndex
CREATE INDEX "tour_guide_assignments_tourScheduleId_idx" ON "tour_guide_assignments"("tourScheduleId");

-- CreateIndex
CREATE INDEX "tour_guide_assignments_guideId_idx" ON "tour_guide_assignments"("guideId");

-- CreateIndex
CREATE INDEX "tour_incidents_organizationId_status_idx" ON "tour_incidents"("organizationId", "status");

-- CreateIndex
CREATE INDEX "tour_incidents_tourScheduleId_idx" ON "tour_incidents"("tourScheduleId");

-- CreateIndex
CREATE INDEX "tour_incidents_tourOperationId_idx" ON "tour_incidents"("tourOperationId");

-- CreateIndex
CREATE INDEX "tour_operation_notes_tourOperationId_idx" ON "tour_operation_notes"("tourOperationId");

-- AddForeignKey
ALTER TABLE "tour_operations" ADD CONSTRAINT "tour_operations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_operations" ADD CONSTRAINT "tour_operations_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "tour_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_checklists" ADD CONSTRAINT "operational_checklists_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_checklists" ADD CONSTRAINT "operational_checklists_tourOperationId_fkey" FOREIGN KEY ("tourOperationId") REFERENCES "tour_operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_checklist_items" ADD CONSTRAINT "operational_checklist_items_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "operational_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifest_versions" ADD CONSTRAINT "manifest_versions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifest_versions" ADD CONSTRAINT "manifest_versions_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "tour_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_maintenance" ADD CONSTRAINT "vehicle_maintenance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_maintenance" ADD CONSTRAINT "vehicle_maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_transport_assignments" ADD CONSTRAINT "tour_transport_assignments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_transport_assignments" ADD CONSTRAINT "tour_transport_assignments_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "tour_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_transport_assignments" ADD CONSTRAINT "tour_transport_assignments_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_transport_assignments" ADD CONSTRAINT "tour_transport_assignments_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_room_types" ADD CONSTRAINT "hotel_room_types_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_room_types" ADD CONSTRAINT "hotel_room_types_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_hotel_assignments" ADD CONSTRAINT "tour_hotel_assignments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_hotel_assignments" ADD CONSTRAINT "tour_hotel_assignments_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "tour_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_hotel_assignments" ADD CONSTRAINT "tour_hotel_assignments_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_allocations" ADD CONSTRAINT "room_allocations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_allocations" ADD CONSTRAINT "room_allocations_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "tour_hotel_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_allocations" ADD CONSTRAINT "room_allocations_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "hotel_room_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_guides" ADD CONSTRAINT "tour_guides_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_guide_assignments" ADD CONSTRAINT "tour_guide_assignments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_guide_assignments" ADD CONSTRAINT "tour_guide_assignments_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "tour_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_guide_assignments" ADD CONSTRAINT "tour_guide_assignments_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "tour_guides"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_incidents" ADD CONSTRAINT "tour_incidents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_incidents" ADD CONSTRAINT "tour_incidents_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "tour_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_incidents" ADD CONSTRAINT "tour_incidents_tourOperationId_fkey" FOREIGN KEY ("tourOperationId") REFERENCES "tour_operations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_operation_notes" ADD CONSTRAINT "tour_operation_notes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_operation_notes" ADD CONSTRAINT "tour_operation_notes_tourOperationId_fkey" FOREIGN KEY ("tourOperationId") REFERENCES "tour_operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
