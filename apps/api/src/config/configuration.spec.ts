import configuration from './configuration';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Server Configuration', () => {
    it('should use default port when PORT is not set', () => {
      delete process.env.PORT;
      const config = configuration();
      expect(config.port).toBe(3001);
    });

    it('should use PORT environment variable when set', () => {
      process.env.PORT = '4000';
      const config = configuration();
      expect(config.port).toBe(4000);
    });

    it('should parse PORT as integer', () => {
      process.env.PORT = '3000';
      const config = configuration();
      expect(config.port).toBe(3000);
      expect(typeof config.port).toBe('number');
    });

    it('should use default nodeEnv when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      const config = configuration();
      expect(config.nodeEnv).toBe('development');
    });

    it('should use NODE_ENV environment variable when set', () => {
      process.env.NODE_ENV = 'production';
      const config = configuration();
      expect(config.nodeEnv).toBe('production');
    });
  });

  describe('Database Configuration', () => {
    it('should use DATABASE_URL environment variable', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';
      const config = configuration();
      expect(config.database.url).toBe(
        'postgresql://user:pass@localhost:5432/testdb',
      );
    });

    it('should set ssl to true in production environment', () => {
      process.env.NODE_ENV = 'production';
      const config = configuration();
      expect(config.database.ssl).toBe(true);
    });

    it('should set ssl to false in non-production environment', () => {
      process.env.NODE_ENV = 'development';
      const config = configuration();
      expect(config.database.ssl).toBe(false);
    });

    it('should use default max connections when not set', () => {
      delete process.env.DB_MAX_CONNECTIONS;
      const config = configuration();
      expect(config.database.maxConnections).toBe(10);
    });

    it('should use DB_MAX_CONNECTIONS environment variable when set', () => {
      process.env.DB_MAX_CONNECTIONS = '20';
      const config = configuration();
      expect(config.database.maxConnections).toBe(20);
    });

    it('should use default connection timeout when not set', () => {
      delete process.env.DB_CONNECTION_TIMEOUT;
      const config = configuration();
      expect(config.database.connectionTimeout).toBe(5000);
    });

    it('should use DB_CONNECTION_TIMEOUT environment variable when set', () => {
      process.env.DB_CONNECTION_TIMEOUT = '10000';
      const config = configuration();
      expect(config.database.connectionTimeout).toBe(10000);
    });
  });

  describe('Security Configuration', () => {
    it('should use default allowed origins when not set', () => {
      delete process.env.ALLOWED_ORIGINS;
      const config = configuration();
      expect(config.security.allowedOrigins).toEqual([
        'http://localhost:3000',
        'http://localhost:3001',
      ]);
    });

    it('should parse ALLOWED_ORIGINS as comma-separated values', () => {
      process.env.ALLOWED_ORIGINS =
        'http://localhost:3000,https://app.example.com,https://api.example.com';
      const config = configuration();
      expect(config.security.allowedOrigins).toEqual([
        'http://localhost:3000',
        'https://app.example.com',
        'https://api.example.com',
      ]);
    });

    it('should handle single allowed origin', () => {
      process.env.ALLOWED_ORIGINS = 'https://production.example.com';
      const config = configuration();
      expect(config.security.allowedOrigins).toEqual([
        'https://production.example.com',
      ]);
    });

    it('should use default rate limit window when not set', () => {
      delete process.env.RATE_LIMIT_WINDOW;
      const config = configuration();
      expect(config.security.rateLimitWindow).toBe(900000); // 15 minutes
    });

    it('should use RATE_LIMIT_WINDOW environment variable when set', () => {
      process.env.RATE_LIMIT_WINDOW = '1800000'; // 30 minutes
      const config = configuration();
      expect(config.security.rateLimitWindow).toBe(1800000);
    });

    it('should use default rate limit max when not set', () => {
      delete process.env.RATE_LIMIT_MAX;
      const config = configuration();
      expect(config.security.rateLimitMax).toBe(100);
    });

    it('should use RATE_LIMIT_MAX environment variable when set', () => {
      process.env.RATE_LIMIT_MAX = '200';
      const config = configuration();
      expect(config.security.rateLimitMax).toBe(200);
    });

    it('should use default JWT secret when not set', () => {
      delete process.env.JWT_SECRET;
      const config = configuration();
      expect(config.security.jwtSecret).toBe('dev-secret-key');
    });

    it('should use JWT_SECRET environment variable when set', () => {
      process.env.JWT_SECRET = 'super-secret-production-key-123456789';
      const config = configuration();
      expect(config.security.jwtSecret).toBe(
        'super-secret-production-key-123456789',
      );
    });

    it('should use default JWT expires in when not set', () => {
      delete process.env.JWT_EXPIRES_IN;
      const config = configuration();
      expect(config.security.jwtExpiresIn).toBe('1h');
    });

    it('should use JWT_EXPIRES_IN environment variable when set', () => {
      process.env.JWT_EXPIRES_IN = '24h';
      const config = configuration();
      expect(config.security.jwtExpiresIn).toBe('24h');
    });
  });

  describe('Performance Configuration', () => {
    it('should use default slow query threshold when not set', () => {
      delete process.env.SLOW_QUERY_THRESHOLD;
      const config = configuration();
      expect(config.performance.slowQueryThreshold).toBe(1000);
    });

    it('should use SLOW_QUERY_THRESHOLD environment variable when set', () => {
      process.env.SLOW_QUERY_THRESHOLD = '2000';
      const config = configuration();
      expect(config.performance.slowQueryThreshold).toBe(2000);
    });

    it('should use default max memory usage when not set', () => {
      delete process.env.MAX_MEMORY_USAGE;
      const config = configuration();
      expect(config.performance.maxMemoryUsage).toBe(10485760); // 10MB
    });

    it('should use MAX_MEMORY_USAGE environment variable when set', () => {
      process.env.MAX_MEMORY_USAGE = '20971520'; // 20MB
      const config = configuration();
      expect(config.performance.maxMemoryUsage).toBe(20971520);
    });
  });

  describe('Pagination Configuration', () => {
    it('should use default pagination limit when not set', () => {
      delete process.env.PAGINATION_DEFAULT_LIMIT;
      const config = configuration();
      expect(config.pagination.defaultLimit).toBe(10);
    });

    it('should use PAGINATION_DEFAULT_LIMIT environment variable when set', () => {
      process.env.PAGINATION_DEFAULT_LIMIT = '20';
      const config = configuration();
      expect(config.pagination.defaultLimit).toBe(20);
    });

    it('should use default pagination max limit when not set', () => {
      delete process.env.PAGINATION_MAX_LIMIT;
      const config = configuration();
      expect(config.pagination.maxLimit).toBe(100);
    });

    it('should use PAGINATION_MAX_LIMIT environment variable when set', () => {
      process.env.PAGINATION_MAX_LIMIT = '200';
      const config = configuration();
      expect(config.pagination.maxLimit).toBe(200);
    });
  });

  describe('Logging Configuration', () => {
    it('should use default log level when not set', () => {
      delete process.env.LOG_LEVEL;
      const config = configuration();
      expect(config.logging.level).toBe('info');
    });

    it('should use LOG_LEVEL environment variable when set', () => {
      process.env.LOG_LEVEL = 'debug';
      const config = configuration();
      expect(config.logging.level).toBe('debug');
    });

    it('should default detailed logs to false when not set', () => {
      delete process.env.ENABLE_DETAILED_LOGS;
      const config = configuration();
      expect(config.logging.enableDetailedLogs).toBe(false);
    });

    it('should enable detailed logs when ENABLE_DETAILED_LOGS is true', () => {
      process.env.ENABLE_DETAILED_LOGS = 'true';
      const config = configuration();
      expect(config.logging.enableDetailedLogs).toBe(true);
    });

    it('should disable detailed logs when ENABLE_DETAILED_LOGS is false', () => {
      process.env.ENABLE_DETAILED_LOGS = 'false';
      const config = configuration();
      expect(config.logging.enableDetailedLogs).toBe(false);
    });

    it('should handle non-boolean values for ENABLE_DETAILED_LOGS', () => {
      process.env.ENABLE_DETAILED_LOGS = 'yes';
      const config = configuration();
      expect(config.logging.enableDetailedLogs).toBe(false); // Only 'true' should enable
    });
  });

  describe('Feature Flags', () => {
    it('should default metrics to false when not set', () => {
      delete process.env.ENABLE_METRICS;
      const config = configuration();
      expect(config.features.enableMetrics).toBe(false);
    });

    it('should enable metrics when ENABLE_METRICS is true', () => {
      process.env.ENABLE_METRICS = 'true';
      const config = configuration();
      expect(config.features.enableMetrics).toBe(true);
    });

    it('should disable metrics when ENABLE_METRICS is false', () => {
      process.env.ENABLE_METRICS = 'false';
      const config = configuration();
      expect(config.features.enableMetrics).toBe(false);
    });

    it('should handle non-boolean values for ENABLE_METRICS', () => {
      process.env.ENABLE_METRICS = '1';
      const config = configuration();
      expect(config.features.enableMetrics).toBe(false); // Only 'true' should enable
    });
  });

  describe('Type Safety and Parsing', () => {
    it('should parse all numeric environment variables as integers', () => {
      process.env.PORT = '3000';
      process.env.DB_MAX_CONNECTIONS = '15';
      process.env.RATE_LIMIT_WINDOW = '1800000';
      process.env.PAGINATION_DEFAULT_LIMIT = '25';

      const config = configuration();

      expect(typeof config.port).toBe('number');
      expect(typeof config.database.maxConnections).toBe('number');
      expect(typeof config.security.rateLimitWindow).toBe('number');
      expect(typeof config.pagination.defaultLimit).toBe('number');
    });

    it('should handle invalid numeric environment variables gracefully', () => {
      process.env.PORT = 'invalid';
      process.env.DB_MAX_CONNECTIONS = '';

      const config = configuration();

      // parseInt should return NaN for invalid values, but the function should still run
      expect(isNaN(config.port)).toBe(true);
      expect(isNaN(config.database.maxConnections)).toBe(true); // Empty string with parseInt results in NaN
    });

    it('should handle empty string environment variables', () => {
      process.env.JWT_SECRET = '';
      process.env.LOG_LEVEL = '';
      process.env.ALLOWED_ORIGINS = '';

      const config = configuration();

      expect(config.security.jwtSecret).toBe(''); // Nullish coalescing preserves empty strings
      expect(config.logging.level).toBe(''); // Nullish coalescing preserves empty strings
      expect(config.security.allowedOrigins).toEqual(['']); // Split of empty string
    });
  });

  describe('Integration scenarios', () => {
    it('should configure for development environment', () => {
      process.env.NODE_ENV = 'development';
      process.env.PORT = '3001';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/asmovie_dev';
      process.env.LOG_LEVEL = 'debug';
      process.env.ENABLE_DETAILED_LOGS = 'true';

      const config = configuration();

      expect(config.nodeEnv).toBe('development');
      expect(config.port).toBe(3001);
      expect(config.database.ssl).toBe(false);
      expect(config.logging.level).toBe('debug');
      expect(config.logging.enableDetailedLogs).toBe(true);
    });

    it('should configure for production environment', () => {
      process.env.NODE_ENV = 'production';
      process.env.PORT = '80';
      process.env.DATABASE_URL = 'postgresql://prod-db:5432/asmovie';
      process.env.JWT_SECRET = 'super-secure-production-secret-key-123456789';
      process.env.ALLOWED_ORIGINS =
        'https://app.asmovie.com,https://admin.asmovie.com';
      process.env.RATE_LIMIT_MAX = '1000';
      process.env.ENABLE_METRICS = 'true';

      const config = configuration();

      expect(config.nodeEnv).toBe('production');
      expect(config.port).toBe(80);
      expect(config.database.ssl).toBe(true);
      expect(config.security.jwtSecret).toBe(
        'super-secure-production-secret-key-123456789',
      );
      expect(config.security.allowedOrigins).toEqual([
        'https://app.asmovie.com',
        'https://admin.asmovie.com',
      ]);
      expect(config.security.rateLimitMax).toBe(1000);
      expect(config.features.enableMetrics).toBe(true);
    });

    it('should configure for test environment', () => {
      process.env.NODE_ENV = 'test';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/asmovie_test';
      process.env.LOG_LEVEL = 'error';
      process.env.ENABLE_DETAILED_LOGS = 'false';
      process.env.ENABLE_METRICS = 'false';

      const config = configuration();

      expect(config.nodeEnv).toBe('test');
      expect(config.database.ssl).toBe(false);
      expect(config.logging.level).toBe('error');
      expect(config.logging.enableDetailedLogs).toBe(false);
      expect(config.features.enableMetrics).toBe(false);
    });
  });
});
