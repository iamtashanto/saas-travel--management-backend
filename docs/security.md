# Security & Threat Model

## Data Isolation
- Cross-tenant data leaks are the primary threat. Every database query acting on tenant-owned resources MUST include `where: { organizationId: req.auth.organizationId }`.

## Token Security
- **JWT Forgery**: Mitigated by strong HS256/RS256 secrets.
- **Refresh Token Theft**: Mitigated by Rotation + Reuse Detection.
- **Session Hijacking**: Mitigated by tying tokens to IP/UserAgent heuristics (optional future enhancement) and short-lived access tokens.

## IDOR (Insecure Direct Object Reference)
- Endpoint handlers must NEVER assume URL parameters (`/:id`) imply ownership. The `organizationId` boundary must always be asserted.

## Auditing
- All sensitive actions (`USER_REGISTERED`, `LOGIN_FAILED`, `PASSWORD_CHANGED`) are tracked via immutable `AuditLog` records.
