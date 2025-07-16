# ASMovie Monorepo

ASMovie is a full-stack movie management system. This monorepo currently contains two main applications:

- **api**: Backend built with [NestJS](https://nestjs.com/)
- **client**: Frontend built with [Next.js](https://nextjs.org/)

---

## Requirements for Local Development

- Node.js >= 18.x
- npm >= 9.x
- Docker (optional, for running the database and API in containers)

---

## Install Dependencies

```bash
npm install
```

---

## Run the API (NestJS)

### Locally

```bash
cd apps/api
npm run start:dev
```
- The API will be available at [http://localhost:3001](http://localhost:3001)

### With Docker

```bash
cd apps/api
npm run docker:up
```
- The API will be available at [http://localhost:3001](http://localhost:3001)

> **Note:** To stop the Docker containers, use:
>
> ```bash
> cd apps/api
> npm run stop:docker
> ```

---

## Run the Client (Next.js)

```bash
cd apps/client
npm run dev
```
- The client will be available at [http://localhost:3000](http://localhost:3000)

---

## Database: Seed and Reset

- To seed the database:

```bash
cd apps/api
npm run seed
```

- To force a database reset (destructive, development only):

```bash
cd apps/api
npx prisma migrate reset --force
```

---

## Default User for Login

- After seeding the database, you can log in with the following default user:
  - **Email:** admin@mail.test
  - **Password:** password

---

## Environment Variables

1. Copy the `.env.example` files to `.env` in each app (`api` and `client`).
2. **IMPORTANT:** If you use Docker, you MUST change the `DATABASE_URL` value in the API `.env` file so it points to the database container (see the example in `.env.example`).

---

## Using Bruno (API Testing)

- [Bruno](https://www.usebruno.com/) is used to test API endpoints.
- **Protected endpoints** (POST, DELETE, PATCH) require authentication and can be accessed in two ways:
  - **API TOKEN:** Defined in the API `.env` file as `API_TOKEN`.
  - **JWT:** Obtained by logging in (see `/auth/login`).
- To obtain a JWT in Bruno, first run the login user endpoint and use the returned token for subsequent requests.
- Sync the API token using:

```bash
cd apps/api
npm run sync-bruno-token
```

---

## API Rate Limiting

The API implements rate limiting to protect against abuse:
- **Limit:** 100 requests per IP
- **Window:** 15 minutes (900,000 ms)
- If the limit is exceeded, the API responds with HTTP 429 (Too Many Requests) and temporarily blocks the IP.
- Limits and time windows are configured in the API code and can be adjusted as needed (see `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW` in the API `.env` file).

---

## Deploy

- **Client (Next.js):** Deploys to [Vercel](https://vercel.com/).
- **API (NestJS):** Deploys to AWS EC2 using an infrastructure script with AWS CDK. The script supports HTTPS and automates deployment.

---

## Final Notes

This README contains only the essential information to:
- Run the app locally (API and client, with or without Docker)
- Deploy the API to AWS
- Deploy the client to Vercel

For advanced details, see the specific `README.md` files in each app or the source code.
