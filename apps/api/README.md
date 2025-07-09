# ASMovie API

This is the backend API for the ASMovie system, built with NestJS and TypeScript.

## Requirements

- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL (local or via Docker)
- Docker (optional, for running the API and database in containers)

## Environment Setup

1. Copy `.env.example` to `.env` and adjust values as needed.
   - For Docker, set `DATABASE_URL` to use the `postgres` hostname (see example in `.env.example`).
   - Set `API_TOKEN` and `JWT_SECRET` for authentication.
2. Install dependencies:

```bash
npm install
```

## Running the API

### Local Development (requires local PostgreSQL running)

```bash
npm run start:dev
```
- The API will be available at [http://localhost:3001](http://localhost:3001)

### With Docker (runs both API and PostgreSQL)

```bash
docker-compose up --build
```
- The API will be available at [http://localhost:3001](http://localhost:3001)
- To stop:
```bash
docker-compose down
```

## Database Migrations & Seed

- Migrate and seed (local):
```bash
npx prisma migrate deploy
npx prisma db seed
```
- Seed only:
```bash
npm run seed
```
- Force reset (development only):
```bash
npx prisma migrate reset --force
```

## Authentication

- Protected endpoints (POST, DELETE, PATCH) require authentication.
- You can use either:
  - API Token: set in `.env` as `API_TOKEN` (sent as `x-api-token` header)
  - JWT: obtained via `/auth/login` (sent as `Authorization: Bearer <token>`)

## Bruno API Testing

- Use Bruno collections in `/bruno` to test endpoints.
- For JWT, run the login endpoint first and use the returned token.
- To sync the API token for Bruno:
```bash
npm run sync-bruno-token
```

## Rate Limiting

- 100 requests per IP per 15 minutes (configurable via `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW` in `.env`).
- Exceeding the limit returns HTTP 429.

## Testing

- Unit tests:
```bash
npm run test:unit
```
- Integration tests:
```bash
npm run test:integration
```
- All tests:
```bash
npm run test:all
```
- Coverage:
```bash
npm run test:cov
```

## Linting & Formatting

- Lint:
```bash
npm run lint
```
- Format:
```bash
npm run format
```

## Deployment

- For production deployment, see the root README and `deploy-one-click.sh` for AWS/CDK automation.

## Default User for Login

After seeding the database, you can log in with the following default user:
- Email: admin@mail.test
- Password: password

---

For more details, see the codebase and environment files.
