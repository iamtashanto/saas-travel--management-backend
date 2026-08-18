# Role-Based Access Control (RBAC)

This module handles the granular permissions framework and custom roles for a tenant.

## Endpoints

- `GET /api/v1/permissions`
- `GET /api/v1/roles`
- `GET /api/v1/roles/:roleId`
- `POST /api/v1/roles`
- `PATCH /api/v1/roles/:roleId`
- `DELETE /api/v1/roles/:roleId`
- `PUT /api/v1/roles/:roleId/permissions`

## Features

- **Permission Catalog**: System-level catalog of atomic permissions (e.g., `booking.create`, `staff.invite`) filtered by module.
- **System Roles**: `isSystem` roles (like the default `owner`) cannot be deleted or modified fundamentally by tenants.
- **Custom Roles**: Tenants can create custom roles (e.g., `tour_manager`) and assign them specific permissions.
- **Strict Role Uniqueness**: Role slugs are unique per organization.
- **Safe Deletion**: A role cannot be deleted if there are any users actively assigned to it.
