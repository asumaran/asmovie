FROM node:20-alpine

# Install dependencies for development
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies)
# Use --legacy-peer-deps if needed for compatibility
RUN npm install && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Copy source code and scripts
COPY src ./src
COPY *.json ./
COPY nest-cli.json ./
COPY sync-bruno-token.js ./
COPY bruno ./bruno

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3001

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "start:dev"]
