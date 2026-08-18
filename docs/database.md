# Database Architecture

## Core Principles
1. **Normalization**: The database is structured to minimize duplication while maintaining clear relational integrity.
2. **UUID Strategy**: All Primary Keys utilize UUID (`@db.Uuid`). This mitigates enumeration attacks, guarantees uniqueness across distributed systems, and obfuscates business volume.
3. **Financial Immutability**: Critical financial records (e.g. Payments, Bookings) are append-oriented. Historical records must not be physically deleted. Adjustments are handled via reversals or refunds.
4. **Money & Currency**: Financial values are tracked using `@db.Decimal(18, 2)` to avoid floating-point math errors. Each organization specifies a `defaultCurrency` following ISO 4217, providing flexibility for global operation.
5. **Timezone Management**: Internal timestamps use UTC. Presentation layer localization relies on the `timezone` field embedded within the `Organization` or user profile.
6. **Soft Deletion**: For operational safety, master data entities (e.g. Organizations, Users, Tours) use a `deletedAt` field. Application logic explicitly excludes records where `deletedAt != null`.

## Audit Strategy
Audit logging is critical for SaaS multi-tenancy. The `AuditLog` model tracks mutations.
- **Append-Only**: Audit logs cannot be updated or deleted via standard CRUD operations.
- **JSON Storage**: `oldValues` and `newValues` use `JSONB` to capture entity states agnostically, decoupling the audit structure from future schema modifications.
- **Tenant Context**: Logs capture `organizationId` and `userId` where applicable to provide clear trails of accountability.
