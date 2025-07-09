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

## Deployment to AWS (EC2/CDK)

### Prerequisites

- AWS CLI installed and configured (`aws configure`)
- Node.js >= 18.x and npm >= 9.x installed locally
- AWS account with permissions to create EC2, VPC, RDS, and related resources
- SSH access to EC2 (key will be created automatically if not present)
- (First time only) Install AWS CDK globally:
  ```bash
  npm install -g aws-cdk
  ```

### Steps

1. **Configure AWS CLI**
   ```bash
   aws configure
   # Set your AWS Access Key, Secret, and default region (e.g., us-east-1)
   ```

2. **Prepare Environment**
   - Ensure your `.env` file is ready with production values (API_TOKEN, JWT_SECRET, etc).
   - The deployment will use the `.env` file in `apps/api`.

3. **Run the One-Click Deployment Task**
   From the `apps/api` directory, it is recommended to use the npm task instead of running the script directly:
   ```bash
   npm run deploy:aws
   ```
   - This will execute `deploy-one-click.sh` and perform all deployment steps.
   - To force a full redeploy (destroy and recreate the stack):
     ```bash
     npm run deploy:aws:force
     ```

4. **After Deployment**
   - The API will be available at the URL shown in the script output (typically `https://<your-ec2-public-dns>:3001` or via an Elastic IP).
   - You can SSH into the instance using the key at `~/.ssh/asmovie-keypair.pem`:
     ```bash
     ssh -i ~/.ssh/asmovie-keypair.pem ec2-user@<EC2_PUBLIC_IP>
     ```
   - The deployment process:
     - Installs all dependencies
     - Runs database migrations and seeds
     - Starts the API with PM2 for process management
     - Updates Bruno production environment with the new API URL

5. **Updating Code (Zero Downtime)**
   - To update the code on the deployed EC2 instance without recreating the stack, use the npm task:
     ```bash
     npm run deploy:update
     ```
   - This will:
     - Pull the latest code from the main branch
     - Install dependencies, build, migrate, and restart the API

6. **Destroying the Stack**
   - To remove all AWS resources created by the stack:
     ```bash
     cd infrastructure
     npm run destroy
     ```

## HTTPS, Nginx, and Public API Endpoint

In production, the API is served securely over HTTPS at `https://api.asumaran.com`.

- **HTTPS/SSL**: The deployment process automatically configures Nginx as a reverse proxy in front of the NestJS API. Nginx handles HTTPS termination using SSL certificates provisioned by Let's Encrypt.
- **Domain**: The API is accessible at `https://api.asumaran.com` (see CloudFormation stack outputs for the exact endpoint after deployment).
- **Certificates**: SSL certificates are obtained and renewed automatically via Certbot (Let's Encrypt) during deployment.
- **Reverse Proxy**: Nginx forwards HTTPS traffic to the API running on port 3001 internally.
- **No manual steps required**: All HTTPS and domain configuration is handled by the deployment scripts and AWS CDK stack.
- **Troubleshooting**: For issues with HTTPS or domain setup, check the Nginx logs on the EC2 instance and the CloudFormation stack events in the AWS Console.

### Vercel Integration, HTTPS Requirement, and CORS

- **HTTPS is required**: The client (Next.js) is deployed on Vercel, which requires the API to be served over HTTPS for secure communication and to avoid mixed content errors.
- **CORS configuration**: The API is configured to allow CORS requests from the Vercel deployment domain (e.g., `https://asmovie-client.vercel.app`). This ensures the client can interact with the API securely from the browser.
- **Where to change allowed origins**: If you change the public API domain or the Vercel client domain, you must update the allowed origins in the CORS configuration. This is set in the file `apps/api/infrastructure/lib/asmovie-ec2-stack.ts` in the line that sets the `ALLOWED_ORIGINS` environment variable (inside the EC2 UserData deployment script). Edit the value to include your new client domain(s), then commit and push the change to your repository.
- **Force full redeploy**: After committing the change, you must force a full redeploy to apply the new configuration. Run:
  ```bash
  npm run deploy:aws:force
  ```
  This will destroy and recreate the stack with the updated configuration.

### Using a Custom Domain

To deploy the API using your own domain instead of `api.asumaran.com`:

1. **Elastic IP Assignment**: The deployment process allocates an AWS Elastic IP (EIP) and associates it with the EC2 instance. This ensures your public IP address remains static, even if the instance is stopped or restarted.
2. **DNS Configuration**: Point your domain's A record to the Elastic IP address assigned to the EC2 instance. The EIP can be found in the CloudFormation outputs or AWS EC2 Console after deployment.
3. **Domain Parameter**: If the CDK stack or deployment scripts support a domain parameter, set it to your custom domain before deploying. Otherwise, update the relevant configuration or environment variable to reflect your domain.
4. **Redeploy**: Run the deployment task (`npm run deploy:aws`) to provision SSL certificates and configure Nginx for your domain. Certbot will automatically request and install a certificate for the specified domain.
5. **Access**: Once DNS propagation is complete and deployment finishes, your API will be available at `https://<your-domain>`.
6. **Renewal**: SSL certificates will be renewed automatically by Certbot.
7. **CORS update**: Remember to update the CORS configuration in the API if you change the public API or client domain, to ensure the client can access the API without issues.

---

- The deployment is fully automated and will set up all required AWS resources.
- The API will be available on port 3001 by default.
- Default test users are created during seed (see "Default User for Login" section).
- All environment variables must be set correctly in `.env` before deploying.
- For troubleshooting, check the CloudFormation stack in the AWS Console and the EC2 instance logs.

## Default User for Login

After seeding the database, you can log in with the following default user:
- Email: admin@mail.test
- Password: password

---

For more details, see the codebase and environment files.
