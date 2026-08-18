# Travel Business SaaS API

Multi-tenant Travel Business Operating System API built with Node.js, Express, and TypeScript.

## Tech Stack
- Node.js 22+
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Redis
- Zod (Validation)
- Pino (Logging)
- Jest & Supertest (Testing)

## Requirements
- Node.js 22+
- Docker & Docker Compose

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start services (PostgreSQL, Redis):
   ```bash
   docker compose up -d
   ```
3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## Documentation
- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [API Conventions](docs/api-conventions.md)
- [Roadmap](docs/roadmap.md)
