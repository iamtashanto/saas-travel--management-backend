# Authentication

## Token Strategy
- **Access Tokens**: Short-lived (15m default), stateless JWTs containing user and tenant context.
- **Refresh Tokens**: Long-lived (30d default), stateful tokens securely hashed and persisted via `AuthSession`. 
- **Rotation**: Refresh tokens rotate upon use. The old token is invalidated.
- **Reuse Detection**: If an invalidated refresh token is presented, we assume token theft and immediately revoke the entire session hierarchy for that user, triggering a `REFRESH_TOKEN_REUSE_DETECTED` audit event.

## Registration
Registration uses a single atomic transaction to provision:
1. Organization
2. Organization Settings
3. Owner Role
4. User
5. UserRole Mapping

## Password Security
- **Hashing**: Strong bcrypt hashing (`saltRounds = 12`).
- **Reset**: Ephemeral token exchanged for password replacement. Resets trigger global session revocation.

## Account Lockout
- 5 failed attempts trigger a 15-minute lock.
- Configurable via `MAX_LOGIN_ATTEMPTS` and `LOGIN_LOCK_DURATION_MINUTES`.
