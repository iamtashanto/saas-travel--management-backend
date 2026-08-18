# Multi-Tenancy Foundation

## What is a Tenant?
In the context of the Travel Business SaaS, a **Tenant** corresponds to an `Organization`. Examples include independent travel agencies, tour groups, or DMCs. All tenants operate on a single shared infrastructure (database and application layer) while maintaining strict data isolation.

## Data Ownership
- **Tenant-Owned Data**: Entities directly tied to daily operations (e.g., Users, Roles, Sequences, AuditLogs). These MUST contain an `organizationId`.
- **Platform-Owned Data**: Global entities managing the SaaS itself (e.g., PlatformAdmin, SaaS Plans, global Permissions). These operate independently of specific tenants.

## Isolation Strategy
1. **Database Level**: The `organizationId` is the fundamental pillar of isolation. Composite unique constraints (e.g., `@@unique([organizationId, email])`) guarantee logical boundaries.
2. **Query Level**: All repositories and services interacting with tenant data MUST explicitly filter by the authenticated context's `organizationId`.
3. **Application Level**: Future authorization middlewares will securely extract `organizationId` from JWT tokens and inject it into the request context, eliminating manual tracking errors.

## Cross-Tenant Access Prevention
Cross-tenant operations are strictly prohibited at the application layer. Background jobs and reporting modules must also ingest tenant contexts to ensure localized execution.
