# Staff Management

This module handles provisioning, role assignment, and lifecycle management for tenant staff users.

## Endpoints

- `GET /api/v1/staff`
- `GET /api/v1/staff/:userId`
- `PATCH /api/v1/staff/:userId`
- `PATCH /api/v1/staff/:userId/status`
- `PUT /api/v1/staff/:userId/roles`
- `DELETE /api/v1/staff/:userId`
- `POST /api/v1/staff/:userId/revoke-sessions`
- `POST /api/v1/staff/invitations`
- `GET /api/v1/staff/invitations`
- `DELETE /api/v1/staff/invitations/:invitationId`

## Features

- **Role Management**: Assign one or multiple roles to a user.
- **Owner Protection**: A tenant cannot be left without an active OWNER.
  - Revoking the OWNER role from the last active owner is blocked.
  - Suspending or deactivating the last active owner is blocked.
  - A regular user (even with `staff.roles.update`) cannot assign the `owner` role unless they themselves possess it.
- **Invitation Lifecycle**: Sends email to invited users, supports multiple roles for an invitee, soft-cancels overlapping pending invitations safely.
- **Session Revocation**: Tenant admins can forcibly revoke all active sessions for a staff member during off-boarding or security incidents.
- **Soft Deletion**: Staff records are never hard-deleted to preserve historical references in Audit Logs and bookings.
