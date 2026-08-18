-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TravelerType" AS ENUM ('ADULT', 'CHILD', 'INFANT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'HELD', 'AWAITING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('WEBSITE', 'ADMIN', 'PHONE', 'WHATSAPP', 'FACEBOOK', 'OFFICE', 'REFERRAL', 'OTHER');

-- CreateEnum
CREATE TYPE "PriceItemType" AS ENUM ('ADULT', 'CHILD', 'INFANT', 'ADDON', 'DISCOUNT', 'FEE');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('HELD', 'CONFIRMED', 'RELEASED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BookingNoteVisibility" AS ENUM ('INTERNAL', 'CUSTOMER_VISIBLE');

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "displayName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "normalizedPhone" TEXT,
    "whatsappPhone" TEXT,
    "countryCode" TEXT,
    "dateOfBirth" DATE,
    "gender" TEXT,
    "address" TEXT,
    "city" TEXT,
    "district" TEXT,
    "country" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "notes" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travelers" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "displayName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "dateOfBirth" DATE,
    "gender" TEXT,
    "nationality" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "specialRequirements" TEXT,
    "notes" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travelers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "customerId" UUID NOT NULL,
    "tourPackageId" UUID NOT NULL,
    "tourScheduleId" UUID NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "bookingSource" "BookingSource" NOT NULL DEFAULT 'WEBSITE',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BDT',
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "addonAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "feeAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "dueAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "travelerCount" INTEGER NOT NULL,
    "adultCount" INTEGER NOT NULL DEFAULT 0,
    "childCount" INTEGER NOT NULL DEFAULT 0,
    "infantCount" INTEGER NOT NULL DEFAULT 0,
    "specialRequest" TEXT,
    "internalNote" TEXT,
    "expiresAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_travelers" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "travelerId" UUID NOT NULL,
    "travelerType" "TravelerType" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "unitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pickupPointId" UUID,
    "specialRequirement" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_travelers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_price_items" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "type" "PriceItemType" NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BDT',

    CONSTRAINT "booking_price_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_addons" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "tourAddonId" UUID NOT NULL,
    "nameSnapshot" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BDT',

    CONSTRAINT "booking_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_reservations" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "tourScheduleId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_status_history" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "fromStatus" "BookingStatus",
    "toStatus" "BookingStatus" NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "changedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_notes" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "visibility" "BookingNoteVisibility" NOT NULL DEFAULT 'INTERNAL',
    "authorId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_records" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "requestHash" TEXT,
    "status" TEXT NOT NULL,
    "response" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customers_organizationId_normalizedPhone_idx" ON "customers"("organizationId", "normalizedPhone");

-- CreateIndex
CREATE INDEX "customers_organizationId_email_idx" ON "customers"("organizationId", "email");

-- CreateIndex
CREATE INDEX "customers_organizationId_status_idx" ON "customers"("organizationId", "status");

-- CreateIndex
CREATE INDEX "travelers_organizationId_customerId_idx" ON "travelers"("organizationId", "customerId");

-- CreateIndex
CREATE INDEX "travelers_organizationId_phone_idx" ON "travelers"("organizationId", "phone");

-- CreateIndex
CREATE INDEX "travelers_organizationId_email_idx" ON "travelers"("organizationId", "email");

-- CreateIndex
CREATE INDEX "bookings_organizationId_customerId_idx" ON "bookings"("organizationId", "customerId");

-- CreateIndex
CREATE INDEX "bookings_organizationId_tourScheduleId_idx" ON "bookings"("organizationId", "tourScheduleId");

-- CreateIndex
CREATE INDEX "bookings_organizationId_status_idx" ON "bookings"("organizationId", "status");

-- CreateIndex
CREATE INDEX "bookings_expiresAt_idx" ON "bookings"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_organizationId_bookingReference_key" ON "bookings"("organizationId", "bookingReference");

-- CreateIndex
CREATE INDEX "booking_travelers_bookingId_idx" ON "booking_travelers"("bookingId");

-- CreateIndex
CREATE INDEX "booking_price_items_bookingId_idx" ON "booking_price_items"("bookingId");

-- CreateIndex
CREATE INDEX "booking_addons_bookingId_idx" ON "booking_addons"("bookingId");

-- CreateIndex
CREATE INDEX "seat_reservations_organizationId_tourScheduleId_status_idx" ON "seat_reservations"("organizationId", "tourScheduleId", "status");

-- CreateIndex
CREATE INDEX "seat_reservations_expiresAt_idx" ON "seat_reservations"("expiresAt");

-- CreateIndex
CREATE INDEX "booking_status_history_bookingId_createdAt_idx" ON "booking_status_history"("bookingId", "createdAt");

-- CreateIndex
CREATE INDEX "booking_notes_bookingId_idx" ON "booking_notes"("bookingId");

-- CreateIndex
CREATE INDEX "idempotency_records_expiresAt_idx" ON "idempotency_records"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_organizationId_key_key" ON "idempotency_records"("organizationId", "key");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travelers" ADD CONSTRAINT "travelers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travelers" ADD CONSTRAINT "travelers_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "tour_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "tour_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_travelers" ADD CONSTRAINT "booking_travelers_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_travelers" ADD CONSTRAINT "booking_travelers_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "travelers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_travelers" ADD CONSTRAINT "booking_travelers_pickupPointId_fkey" FOREIGN KEY ("pickupPointId") REFERENCES "pickup_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_price_items" ADD CONSTRAINT "booking_price_items_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_addons" ADD CONSTRAINT "booking_addons_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_addons" ADD CONSTRAINT "booking_addons_tourAddonId_fkey" FOREIGN KEY ("tourAddonId") REFERENCES "tour_addons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_reservations" ADD CONSTRAINT "seat_reservations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_reservations" ADD CONSTRAINT "seat_reservations_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_reservations" ADD CONSTRAINT "seat_reservations_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "tour_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_notes" ADD CONSTRAINT "booking_notes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_notes" ADD CONSTRAINT "booking_notes_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idempotency_records" ADD CONSTRAINT "idempotency_records_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
