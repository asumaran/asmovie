# ASMovie Client

This is the frontend for the ASMovie system, built with Next.js and React.

## Requirements

- Node.js >= 18.x
- npm >= 9.x

## Environment Setup

1. Copy `.env.local` or `.env.production` as needed and set `NEXT_PUBLIC_API_URL` to the API base URL.
   - For local development: `NEXT_PUBLIC_API_URL=http://localhost:3001`
   - For production: `NEXT_PUBLIC_API_URL=https://api.asumaran.com` (or your deployed API URL)
2. Install dependencies:

```bash
npm install
```

## Running the Client

### Local Development

```bash
npm run dev
```

- The app will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
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

## API Integration

- The client expects the API to be running and accessible at the URL specified in `NEXT_PUBLIC_API_URL`.
- All authentication and protected endpoints are handled by the API.

## Deployment

- Deploy the client to [Vercel](https://vercel.com/) or any platform supporting Next.js.
- Ensure `NEXT_PUBLIC_API_URL` is set to the correct API endpoint in your production environment.

---

For more details, see the codebase and environment files.
