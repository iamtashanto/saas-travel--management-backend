# Development Guide

## Code Style
- Use `npm run lint` and `npm run format`.
- Strict TypeScript is enforced.
- Do not use `any`.

## Testing
- Write tests using Jest and Supertest.
- Run tests via `npm test`.

## Docker Services
The local environment utilizes `docker-compose.yml` to run PostgreSQL and Redis. Ensure the containers are running before starting the development server.
