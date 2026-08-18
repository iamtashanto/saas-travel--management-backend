-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('INDIVIDUAL', 'CORPORATE', 'B2B', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CorporateClientStatus" AS ENUM ('PROSPECT', 'ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "CorporateContactRole" AS ENUM ('TRAVEL_COORDINATOR', 'HR', 'ADMIN', 'FINANCE', 'MANAGER', 'OTHER');

-- CreateEnum
CREATE TYPE "SalesLeadSource" AS ENUM ('WEBSITE', 'FACEBOOK', 'WHATSAPP', 'PHONE', 'EMAIL', 'REFERRAL', 'EXISTING_CLIENT', 'PARTNER', 'DIRECT', 'OTHER');

-- CreateEnum
CREATE TYPE "SalesLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'REQUIREMENTS_COLLECTED', 'QUOTATION_PREPARING', 'QUOTATION_SENT', 'NEGOTIATION', 'APPROVAL_PENDING', 'WON', 'LOST', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SalesLeadPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "CustomTourStatus" AS ENUM ('REQUESTED', 'REVIEWING', 'REQUIREMENTS_PENDING', 'PLANNING', 'QUOTATION_READY', 'QUOTATION_SENT', 'REVISION_REQUESTED', 'APPROVAL_PENDING', 'APPROVED', 'CONVERTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'INTERNAL_REVIEW', 'SENT', 'VIEWED', 'REVISION_REQUESTED', 'NEGOTIATION', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMilestoneStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'WAIVED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'INTERNAL_REVIEW', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'SENT', 'UNDER_REVIEW', 'SIGNED', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SalesActivityType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'WHATSAPP', 'FOLLOW_UP', 'NOTE', 'DEMO', 'SITE_VISIT', 'OTHER');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "bookingType" "BookingType" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN     "contractId" UUID,
ADD COLUMN     "corporateClientId" UUID,
ADD COLUMN     "quotationId" UUID;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "corporateClientId" UUID;

-- CreateTable
CREATE TABLE "corporate_clients" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "legalName" TEXT,
    "companyCode" TEXT,
    "industry" TEXT,
    "companyType" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "alternatePhone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "contactPersonName" TEXT,
    "contactPersonDesignation" TEXT,
    "contactPersonPhone" TEXT,
    "contactPersonEmail" TEXT,
    "taxIdentifier" TEXT,
    "registrationNumber" TEXT,
    "billingAddress" TEXT,
    "notes" TEXT,
    "status" "CorporateClientStatus" NOT NULL DEFAULT 'PROSPECT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "corporate_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_contacts" (
    "id" UUID NOT NULL,
    "corporateClientId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "alternatePhone" TEXT,
    "department" TEXT,
    "role" "CorporateContactRole" NOT NULL DEFAULT 'OTHER',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_client_notes" (
    "id" UUID NOT NULL,
    "corporateClientId" UUID NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "visibility" "NoteVisibility" NOT NULL DEFAULT 'INTERNAL',
    "authorId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_client_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_leads" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "corporateClientId" UUID,
    "leadNumber" TEXT NOT NULL,
    "source" "SalesLeadSource" NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "destination" TEXT,
    "estimatedTravelers" INTEGER,
    "expectedDate" DATE,
    "budget" DECIMAL(12,2),
    "probability" INTEGER,
    "priority" "SalesLeadPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" UUID,
    "status" "SalesLeadStatus" NOT NULL DEFAULT 'NEW',
    "expectedCloseDate" DATE,
    "lostReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "sales_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_activities" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "leadId" UUID,
    "corporateClientId" UUID,
    "assignedTo" UUID,
    "type" "SalesActivityType" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_ups" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "assignedTo" UUID,
    "priority" "SalesLeadPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_tour_requests" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "corporateClientId" UUID,
    "leadId" UUID,
    "destination" TEXT,
    "origin" TEXT,
    "travelStartDate" DATE,
    "travelEndDate" DATE,
    "duration" INTEGER,
    "adultCount" INTEGER NOT NULL DEFAULT 0,
    "childCount" INTEGER NOT NULL DEFAULT 0,
    "infantCount" INTEGER NOT NULL DEFAULT 0,
    "totalTravelers" INTEGER NOT NULL DEFAULT 0,
    "budgetMin" DECIMAL(12,2),
    "budgetMax" DECIMAL(12,2),
    "transportPreference" TEXT,
    "accommodationPreference" TEXT,
    "mealPreference" TEXT,
    "activityPreference" TEXT,
    "specialRequirements" TEXT,
    "structuredRequirements" JSONB,
    "status" "CustomTourStatus" NOT NULL DEFAULT 'REQUESTED',
    "assignedTo" UUID,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_tour_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentQuotationId" UUID,
    "changeReason" TEXT,
    "corporateClientId" UUID NOT NULL,
    "leadId" UUID,
    "customTourRequestId" UUID,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BDT',
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "feeAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalSellingPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCostPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grossProfit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paymentTerms" TEXT,
    "cancellationTerms" TEXT,
    "notes" TEXT,
    "internalNotes" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "acceptedBy" TEXT,
    "acceptanceMethod" TEXT,
    "acceptanceNote" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_items" (
    "id" UUID NOT NULL,
    "quotationId" UUID NOT NULL,
    "serviceType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT,
    "unitCostPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unitSellingPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "costTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sellingTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_payment_milestones" (
    "id" UUID NOT NULL,
    "quotationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DECIMAL(5,2),
    "amount" DECIMAL(12,2) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "PaymentMilestoneStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "quotation_payment_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "requestedBy" UUID NOT NULL,
    "approverId" UUID,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "proposalNumber" TEXT NOT NULL,
    "quotationId" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "validUntil" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "introduction" TEXT,
    "content" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_contracts" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentContractId" UUID,
    "changeReason" TEXT,
    "corporateClientId" UUID NOT NULL,
    "quotationId" UUID,
    "proposalId" UUID,
    "title" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "contractValue" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BDT',
    "paymentTerms" TEXT,
    "cancellationTerms" TEXT,
    "specialTerms" TEXT,
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "corporate_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "corporate_clients_organizationId_companyName_idx" ON "corporate_clients"("organizationId", "companyName");

-- CreateIndex
CREATE INDEX "corporate_clients_organizationId_status_idx" ON "corporate_clients"("organizationId", "status");

-- CreateIndex
CREATE INDEX "corporate_contacts_corporateClientId_idx" ON "corporate_contacts"("corporateClientId");

-- CreateIndex
CREATE INDEX "sales_leads_organizationId_status_idx" ON "sales_leads"("organizationId", "status");

-- CreateIndex
CREATE INDEX "sales_leads_assignedTo_idx" ON "sales_leads"("assignedTo");

-- CreateIndex
CREATE UNIQUE INDEX "sales_leads_organizationId_leadNumber_key" ON "sales_leads"("organizationId", "leadNumber");

-- CreateIndex
CREATE INDEX "sales_activities_leadId_idx" ON "sales_activities"("leadId");

-- CreateIndex
CREATE INDEX "sales_activities_corporateClientId_idx" ON "sales_activities"("corporateClientId");

-- CreateIndex
CREATE INDEX "sales_activities_assignedTo_idx" ON "sales_activities"("assignedTo");

-- CreateIndex
CREATE INDEX "follow_ups_assignedTo_idx" ON "follow_ups"("assignedTo");

-- CreateIndex
CREATE INDEX "follow_ups_dueAt_idx" ON "follow_ups"("dueAt");

-- CreateIndex
CREATE INDEX "custom_tour_requests_organizationId_status_idx" ON "custom_tour_requests"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "custom_tour_requests_organizationId_requestNumber_key" ON "custom_tour_requests"("organizationId", "requestNumber");

-- CreateIndex
CREATE INDEX "quotations_organizationId_status_idx" ON "quotations"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_organizationId_quotationNumber_version_key" ON "quotations"("organizationId", "quotationNumber", "version");

-- CreateIndex
CREATE INDEX "quotation_items_quotationId_idx" ON "quotation_items"("quotationId");

-- CreateIndex
CREATE INDEX "quotation_payment_milestones_quotationId_idx" ON "quotation_payment_milestones"("quotationId");

-- CreateIndex
CREATE INDEX "approval_requests_organizationId_status_idx" ON "approval_requests"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_organizationId_proposalNumber_version_key" ON "proposals"("organizationId", "proposalNumber", "version");

-- CreateIndex
CREATE INDEX "corporate_contracts_organizationId_status_idx" ON "corporate_contracts"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "corporate_contracts_organizationId_contractNumber_version_key" ON "corporate_contracts"("organizationId", "contractNumber", "version");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_corporateClientId_fkey" FOREIGN KEY ("corporateClientId") REFERENCES "corporate_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_corporateClientId_fkey" FOREIGN KEY ("corporateClientId") REFERENCES "corporate_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "corporate_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_clients" ADD CONSTRAINT "corporate_clients_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_contacts" ADD CONSTRAINT "corporate_contacts_corporateClientId_fkey" FOREIGN KEY ("corporateClientId") REFERENCES "corporate_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_client_notes" ADD CONSTRAINT "corporate_client_notes_corporateClientId_fkey" FOREIGN KEY ("corporateClientId") REFERENCES "corporate_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_leads" ADD CONSTRAINT "sales_leads_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_leads" ADD CONSTRAINT "sales_leads_corporateClientId_fkey" FOREIGN KEY ("corporateClientId") REFERENCES "corporate_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_activities" ADD CONSTRAINT "sales_activities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_activities" ADD CONSTRAINT "sales_activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "sales_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_activities" ADD CONSTRAINT "sales_activities_corporateClientId_fkey" FOREIGN KEY ("corporateClientId") REFERENCES "corporate_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "sales_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_tour_requests" ADD CONSTRAINT "custom_tour_requests_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_tour_requests" ADD CONSTRAINT "custom_tour_requests_corporateClientId_fkey" FOREIGN KEY ("corporateClientId") REFERENCES "corporate_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_tour_requests" ADD CONSTRAINT "custom_tour_requests_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "sales_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_parentQuotationId_fkey" FOREIGN KEY ("parentQuotationId") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_corporateClientId_fkey" FOREIGN KEY ("corporateClientId") REFERENCES "corporate_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "sales_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customTourRequestId_fkey" FOREIGN KEY ("customTourRequestId") REFERENCES "custom_tour_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_payment_milestones" ADD CONSTRAINT "quotation_payment_milestones_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_quotation_fkey" FOREIGN KEY ("entityId") REFERENCES "quotations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_contracts" ADD CONSTRAINT "corporate_contracts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_contracts" ADD CONSTRAINT "corporate_contracts_parentContractId_fkey" FOREIGN KEY ("parentContractId") REFERENCES "corporate_contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_contracts" ADD CONSTRAINT "corporate_contracts_corporateClientId_fkey" FOREIGN KEY ("corporateClientId") REFERENCES "corporate_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_contracts" ADD CONSTRAINT "corporate_contracts_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corporate_contracts" ADD CONSTRAINT "corporate_contracts_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
