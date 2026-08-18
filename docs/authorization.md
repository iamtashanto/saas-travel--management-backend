# Authorization & Role-Based Access Control

## Multi-Tenant Context
All protected operations rely on the `organizationId` embedded inside the validated JWT. **Never trust client-provided tenant IDs**.

## Effective Permissions
A user may belong to multiple `Roles` via `UserRole`. Their effective permissions are the union of all `Permission` mappings associated with their active roles.

## Middleware Stack
To secure a route, the following chain is standard:
```typescript
router.get(
  "/resource",
  requireAuth, // Validates JWT
  requireActiveOrganization, // Confirms Org isn't suspended
  requirePermission("resource.read"), // Verifies RBAC
  controller.handler
);
```

## Security Order
1. Authentication (Who are you?)
2. Tenant Context (Are you active in this tenant?)
3. Permission Verification (Are you allowed to do this?)
4. Resource Ownership Verification (Does this resource belong to your tenant?)
