# Organization Management

This module manages the profile and settings of each tenant (Travel Business) in the SaaS platform. 

## Endpoints

- `GET /api/v1/organization`
- `PATCH /api/v1/organization`
- `GET /api/v1/organization/settings`
- `PATCH /api/v1/organization/settings`
- `GET /api/v1/organization/stats`
- `GET /api/v1/organization/security`

## Features

- **Profile Management**: Update core tenant details (name, legal name, logo, contact information).
- **Settings**: Manage local settings like timezone (IANA format), currency (ISO-4217), date/time formats, and business-specific configurations like prefix codes (BKG, INV).
- **Strict Isolation**: All queries enforce `organizationId` filtering seamlessly via `requireActiveOrganization` middleware and `req.auth` propagation.
- **Audit Logging**: Any modifications to organization profile or settings trigger an audit event (`ORGANIZATION_UPDATED`, `ORGANIZATION_SETTINGS_UPDATED`) tracking `oldValues` and `newValues`.
