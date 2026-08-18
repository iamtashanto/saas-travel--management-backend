# Architecture

## Overview
The application follows a modular monolith architecture. Business logic is separated into distinct modules.

## Directory Structure
- `src/common`: Cross-cutting concerns (errors, utils, middleware).
- `src/config`: Environment and database/redis configuration.
- `src/modules`: Domain-specific business logic (Auth, Users, Organizations, etc.).
- `src/routes`: API entrypoints and route aggregations.
- `src/docs`: Swagger OpenAPI definitions.

## Database Access
Data access is isolated to `Prisma Client` within the services layer. Controllers should not directly access the database.

## Error Handling
Errors are centralized using the `AppError` class and intercepted by a global error handler middleware.
