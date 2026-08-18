-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "PlatformAdminStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "DestinationStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PickupPointStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TourPackageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TourScheduleStatus" AS ENUM ('DRAFT', 'OPEN', 'FULL', 'CLOSED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TourAddonStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "platform_admins" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" "PlatformAdminStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "legalName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "defaultCurrency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "countryCode" VARCHAR(2) NOT NULL DEFAULT 'US',
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_settings" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "dateFormat" TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
    "timeFormat" TEXT NOT NULL DEFAULT '24h',
    "weekStartsOn" INTEGER NOT NULL DEFAULT 1,
    "language" TEXT NOT NULL DEFAULT 'en',
    "bookingPrefix" TEXT NOT NULL DEFAULT 'BKG',
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV',
    "quotationPrefix" TEXT NOT NULL DEFAULT 'QUO',
    "customerPrefix" TEXT NOT NULL DEFAULT 'CUS',
    "defaultBookingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "allowOnlineBooking" BOOLEAN NOT NULL DEFAULT false,
    "showPublicSeatAvailability" BOOLEAN NOT NULL DEFAULT false,
    "lowSeatThreshold" INTEGER NOT NULL DEFAULT 5,
    "defaultCancellationPolicy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sequences" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "padding" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'INVITED',
    "passwordChangedAt" TIMESTAMP(3),
    "emailVerifiedAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "lastLoginUserAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "organizationId" UUID,
    "userId" UUID,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_invitations" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "roleIds" UUID[],
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "invitedBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleId" UUID,

    CONSTRAINT "organization_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destinations" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "country" TEXT,
    "division" TEXT,
    "district" TEXT,
    "locationName" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "coverImageUrl" TEXT,
    "status" "DestinationStatus" NOT NULL DEFAULT 'DRAFT',
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_categories" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pickup_points" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "description" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "defaultPickupTime" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "status" "PickupPointStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_packages" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "destinationId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "coverImageUrl" TEXT,
    "durationDays" INTEGER NOT NULL,
    "durationNights" INTEGER NOT NULL,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "childPrice" DECIMAL(12,2),
    "infantPrice" DECIMAL(12,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BDT',
    "status" "TourPackageStatus" NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "internalNotes" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_schedules" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tourPackageId" UUID NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "departureTime" TEXT,
    "returnTime" TEXT,
    "departureLocation" TEXT,
    "returnLocation" TEXT,
    "capacity" INTEGER NOT NULL,
    "minimumRequiredTravelers" INTEGER,
    "basePriceOverride" DECIMAL(12,2),
    "adultPrice" DECIMAL(12,2),
    "childPrice" DECIMAL(12,2),
    "infantPrice" DECIMAL(12,2),
    "bookingOpenAt" TIMESTAMP(3),
    "bookingCloseAt" TIMESTAMP(3),
    "status" "TourScheduleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_itinerary_items" (
    "id" UUID NOT NULL,
    "tourPackageId" UUID NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "time" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_itinerary_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_inclusions" (
    "id" UUID NOT NULL,
    "tourPackageId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tour_inclusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_exclusions" (
    "id" UUID NOT NULL,
    "tourPackageId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tour_exclusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_addons" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "tourPackageId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BDT',
    "capacity" INTEGER,
    "status" "TourAddonStatus" NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tour_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_media" (
    "id" UUID NOT NULL,
    "tourPackageId" UUID NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tour_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_seo" (
    "id" UUID NOT NULL,
    "tourPackageId" UUID NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "canonicalUrl" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImageUrl" TEXT,
    "indexable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tour_seo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_booking_rules" (
    "id" UUID NOT NULL,
    "tourPackageId" UUID NOT NULL,
    "minimumTravelers" INTEGER,
    "maximumTravelers" INTEGER,
    "bookingOpenBeforeDays" INTEGER,
    "bookingCloseBeforeHours" INTEGER,
    "allowChildren" BOOLEAN NOT NULL DEFAULT true,
    "allowInfants" BOOLEAN NOT NULL DEFAULT true,
    "allowOnlineBooking" BOOLEAN NOT NULL DEFAULT true,
    "showPublicAvailability" BOOLEAN NOT NULL DEFAULT true,
    "requireTravelerPhone" BOOLEAN NOT NULL DEFAULT true,
    "requireEmergencyContact" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tour_booking_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_cancellation_policies" (
    "id" UUID NOT NULL,
    "tourPackageId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "allowCancellation" BOOLEAN NOT NULL DEFAULT false,
    "fullRefundBeforeHours" INTEGER,
    "partialRefundBeforeHours" INTEGER,
    "partialRefundPercentage" DECIMAL(5,2),
    "nonRefundableAfterHours" INTEGER,
    "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "tour_cancellation_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_admins_email_key" ON "platform_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_deletedAt_idx" ON "organizations"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "organization_settings_organizationId_key" ON "organization_settings"("organizationId");

-- CreateIndex
CREATE INDEX "sequences_organizationId_idx" ON "sequences"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "sequences_organizationId_key_key" ON "sequences"("organizationId", "key");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE INDEX "users_organizationId_status_idx" ON "users"("organizationId", "status");

-- CreateIndex
CREATE INDEX "users_organizationId_deletedAt_idx" ON "users"("organizationId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_organizationId_email_key" ON "users"("organizationId", "email");

-- CreateIndex
CREATE INDEX "roles_organizationId_idx" ON "roles"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_organizationId_slug_key" ON "roles"("organizationId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE INDEX "permissions_module_idx" ON "permissions"("module");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_idx" ON "audit_logs"("organizationId");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_entityType_entityId_idx" ON "audit_logs"("organizationId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_createdAt_idx" ON "audit_logs"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "auth_sessions_userId_idx" ON "auth_sessions"("userId");

-- CreateIndex
CREATE INDEX "auth_sessions_organizationId_idx" ON "auth_sessions"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_tokenHash_key" ON "email_verification_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "email_verification_tokens_userId_idx" ON "email_verification_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_invitations_tokenHash_key" ON "organization_invitations"("tokenHash");

-- CreateIndex
CREATE INDEX "organization_invitations_organizationId_idx" ON "organization_invitations"("organizationId");

-- CreateIndex
CREATE INDEX "organization_invitations_email_idx" ON "organization_invitations"("email");

-- CreateIndex
CREATE INDEX "destinations_organizationId_idx" ON "destinations"("organizationId");

-- CreateIndex
CREATE INDEX "destinations_status_idx" ON "destinations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "destinations_organizationId_slug_key" ON "destinations"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "tour_categories_organizationId_idx" ON "tour_categories"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "tour_categories_organizationId_slug_key" ON "tour_categories"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "pickup_points_organizationId_idx" ON "pickup_points"("organizationId");

-- CreateIndex
CREATE INDEX "tour_packages_organizationId_idx" ON "tour_packages"("organizationId");

-- CreateIndex
CREATE INDEX "tour_packages_destinationId_idx" ON "tour_packages"("destinationId");

-- CreateIndex
CREATE INDEX "tour_packages_categoryId_idx" ON "tour_packages"("categoryId");

-- CreateIndex
CREATE INDEX "tour_packages_status_idx" ON "tour_packages"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tour_packages_organizationId_slug_key" ON "tour_packages"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "tour_schedules_organizationId_startDate_idx" ON "tour_schedules"("organizationId", "startDate");

-- CreateIndex
CREATE INDEX "tour_schedules_tourPackageId_startDate_idx" ON "tour_schedules"("tourPackageId", "startDate");

-- CreateIndex
CREATE INDEX "tour_schedules_organizationId_status_idx" ON "tour_schedules"("organizationId", "status");

-- CreateIndex
CREATE INDEX "tour_itinerary_items_tourPackageId_idx" ON "tour_itinerary_items"("tourPackageId");

-- CreateIndex
CREATE INDEX "tour_inclusions_tourPackageId_idx" ON "tour_inclusions"("tourPackageId");

-- CreateIndex
CREATE INDEX "tour_exclusions_tourPackageId_idx" ON "tour_exclusions"("tourPackageId");

-- CreateIndex
CREATE INDEX "tour_addons_organizationId_idx" ON "tour_addons"("organizationId");

-- CreateIndex
CREATE INDEX "tour_addons_tourPackageId_idx" ON "tour_addons"("tourPackageId");

-- CreateIndex
CREATE INDEX "tour_media_tourPackageId_idx" ON "tour_media"("tourPackageId");

-- CreateIndex
CREATE UNIQUE INDEX "tour_seo_tourPackageId_key" ON "tour_seo"("tourPackageId");

-- CreateIndex
CREATE UNIQUE INDEX "tour_booking_rules_tourPackageId_key" ON "tour_booking_rules"("tourPackageId");

-- CreateIndex
CREATE UNIQUE INDEX "tour_cancellation_policies_tourPackageId_key" ON "tour_cancellation_policies"("tourPackageId");

-- AddForeignKey
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destinations" ADD CONSTRAINT "destinations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_categories" ADD CONSTRAINT "tour_categories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_points" ADD CONSTRAINT "pickup_points_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_packages" ADD CONSTRAINT "tour_packages_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_packages" ADD CONSTRAINT "tour_packages_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_packages" ADD CONSTRAINT "tour_packages_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "tour_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_schedules" ADD CONSTRAINT "tour_schedules_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_schedules" ADD CONSTRAINT "tour_schedules_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_itinerary_items" ADD CONSTRAINT "tour_itinerary_items_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_inclusions" ADD CONSTRAINT "tour_inclusions_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_exclusions" ADD CONSTRAINT "tour_exclusions_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_addons" ADD CONSTRAINT "tour_addons_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_media" ADD CONSTRAINT "tour_media_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_seo" ADD CONSTRAINT "tour_seo_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_booking_rules" ADD CONSTRAINT "tour_booking_rules_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_cancellation_policies" ADD CONSTRAINT "tour_cancellation_policies_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "tour_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
