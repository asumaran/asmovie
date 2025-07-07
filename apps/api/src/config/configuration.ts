export default () => ({
  // Server Configuration
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS ?? '10', 10),
    connectionTimeout: parseInt(
      process.env.DB_CONNECTION_TIMEOUT ?? '5000',
      10,
    ),
  },

  // Security Configuration
  security: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') ?? [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW ?? '900000', 10), // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    apiSecret: process.env.API_TOKEN ?? 'fallback-secret-2025',
  },

  // Performance Configuration
  performance: {
    slowQueryThreshold: parseInt(
      process.env.SLOW_QUERY_THRESHOLD ?? '1000',
      10,
    ), // 1 second
    maxMemoryUsage: parseInt(process.env.MAX_MEMORY_USAGE ?? '10485760', 10), // 10MB
  },

  // Pagination Configuration
  pagination: {
    defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT ?? '10', 10),
    maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT ?? '100', 10),
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
    enableDetailedLogs: process.env.ENABLE_DETAILED_LOGS === 'true',
  },

  // Feature Flags
  features: {
    enableMetrics: process.env.ENABLE_METRICS === 'true',
  },
});
