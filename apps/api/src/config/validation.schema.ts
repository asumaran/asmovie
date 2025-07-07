import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Server
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),

  // Database
  DATABASE_URL: Joi.string().required(),
  DB_MAX_CONNECTIONS: Joi.number().default(10),
  DB_CONNECTION_TIMEOUT: Joi.number().default(5000),

  // Security
  ALLOWED_ORIGINS: Joi.string().optional(),
  RATE_LIMIT_WINDOW: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX: Joi.number().default(100),
  JWT_SECRET: Joi.string().min(32).optional(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  API_TOKEN: Joi.string().min(16).required(),

  // Performance
  SLOW_QUERY_THRESHOLD: Joi.number().default(1000),
  MAX_MEMORY_USAGE: Joi.number().default(10485760), // 10MB

  // Pagination
  PAGINATION_DEFAULT_LIMIT: Joi.number().default(10),
  PAGINATION_MAX_LIMIT: Joi.number().default(100),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  ENABLE_DETAILED_LOGS: Joi.boolean().default(false),

  // Feature Flags
  ENABLE_METRICS: Joi.boolean().default(false),
});
