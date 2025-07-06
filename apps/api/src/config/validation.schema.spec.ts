import { validationSchema } from './validation.schema';

describe('Validation Schema', () => {
  describe('NODE_ENV validation', () => {
    it('should accept valid NODE_ENV values', () => {
      const validValues = ['development', 'production', 'test'];

      validValues.forEach((value) => {
        const { error } = validationSchema.validate({
          NODE_ENV: value,
          DATABASE_URL: 'postgres://localhost/test',
        });
        expect(error).toBeUndefined();
      });
    });

    it('should reject invalid NODE_ENV values', () => {
      const invalidValues = ['staging', 'local', 'dev', 'prod'];

      invalidValues.forEach((value) => {
        const { error } = validationSchema.validate({ NODE_ENV: value });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('must be one of');
      });
    });

    it('should use default value for NODE_ENV', () => {
      const { value } = validationSchema.validate({});
      expect(value.NODE_ENV).toBe('development');
    });
  });

  describe('PORT validation', () => {
    it('should accept valid port numbers', () => {
      const validPorts = [3000, 3001, 8080, 80, 443];

      validPorts.forEach((port) => {
        const { error } = validationSchema.validate({
          PORT: port,
          DATABASE_URL: 'postgres://localhost/test',
        });
        expect(error).toBeUndefined();
      });
    });

    it('should reject non-numeric port values', () => {
      const { error } = validationSchema.validate({ PORT: 'abc' });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('must be a number');
    });

    it('should use default value for PORT', () => {
      const { value } = validationSchema.validate({});
      expect(value.PORT).toBe(3001);
    });
  });

  describe('DATABASE_URL validation', () => {
    it('should require DATABASE_URL', () => {
      const { error } = validationSchema.validate({});
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('required');
      expect(error?.details[0].path).toEqual(['DATABASE_URL']);
    });

    it('should accept valid database URLs', () => {
      const validUrls = [
        'postgresql://user:pass@localhost:5432/db',
        'postgres://localhost/db',
        'sqlite:memory:',
        'mysql://user:pass@host:3306/db',
      ];

      validUrls.forEach((url) => {
        const { error } = validationSchema.validate({ DATABASE_URL: url });
        expect(error).toBeUndefined();
      });
    });

    it('should reject empty DATABASE_URL', () => {
      const { error } = validationSchema.validate({ DATABASE_URL: '' });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('not allowed to be empty');
    });
  });

  describe('Database connection settings', () => {
    it('should accept valid DB_MAX_CONNECTIONS', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        DB_MAX_CONNECTIONS: 20,
      });
      expect(error).toBeUndefined();
    });

    it('should use default for DB_MAX_CONNECTIONS', () => {
      const { value } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
      });
      expect(value.DB_MAX_CONNECTIONS).toBe(10);
    });

    it('should accept valid DB_CONNECTION_TIMEOUT', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        DB_CONNECTION_TIMEOUT: 10000,
      });
      expect(error).toBeUndefined();
    });

    it('should use default for DB_CONNECTION_TIMEOUT', () => {
      const { value } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
      });
      expect(value.DB_CONNECTION_TIMEOUT).toBe(5000);
    });
  });

  describe('Security configuration validation', () => {
    it('should accept valid ALLOWED_ORIGINS', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        ALLOWED_ORIGINS: 'http://localhost:3000,https://app.example.com',
      });
      expect(error).toBeUndefined();
    });

    it('should make ALLOWED_ORIGINS optional', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
      });
      expect(error).toBeUndefined();
    });

    it('should accept valid rate limit settings', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        RATE_LIMIT_WINDOW: 1800000,
        RATE_LIMIT_MAX: 200,
      });
      expect(error).toBeUndefined();
    });

    it('should use defaults for rate limit settings', () => {
      const { value } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
      });
      expect(value.RATE_LIMIT_WINDOW).toBe(900000);
      expect(value.RATE_LIMIT_MAX).toBe(100);
    });

    it('should validate JWT_SECRET minimum length', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        JWT_SECRET: 'short',
      });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('at least 32 characters');
    });

    it('should accept valid JWT_SECRET', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        JWT_SECRET:
          'this-is-a-very-long-secret-key-that-meets-minimum-requirements',
      });
      expect(error).toBeUndefined();
    });

    it('should make JWT_SECRET optional', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
      });
      expect(error).toBeUndefined();
    });

    it('should accept valid JWT_EXPIRES_IN formats', () => {
      const validFormats = ['1h', '24h', '7d', '30m', '1y'];

      validFormats.forEach((format) => {
        const { error } = validationSchema.validate({
          DATABASE_URL: 'postgres://localhost/test',
          JWT_EXPIRES_IN: format,
        });
        expect(error).toBeUndefined();
      });
    });

    it('should use default for JWT_EXPIRES_IN', () => {
      const { value } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
      });
      expect(value.JWT_EXPIRES_IN).toBe('1h');
    });
  });

  describe('Performance configuration validation', () => {
    it('should accept valid performance settings', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        SLOW_QUERY_THRESHOLD: 2000,
        MAX_MEMORY_USAGE: 20971520,
      });
      expect(error).toBeUndefined();
    });

    it('should use defaults for performance settings', () => {
      const { value } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
      });
      expect(value.SLOW_QUERY_THRESHOLD).toBe(1000);
      expect(value.MAX_MEMORY_USAGE).toBe(10485760);
    });

    it('should reject non-numeric performance values', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        SLOW_QUERY_THRESHOLD: 'fast',
      });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('must be a number');
    });
  });

  describe('Pagination configuration validation', () => {
    it('should accept valid pagination settings', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        PAGINATION_DEFAULT_LIMIT: 20,
        PAGINATION_MAX_LIMIT: 200,
      });
      expect(error).toBeUndefined();
    });

    it('should use defaults for pagination settings', () => {
      const { value } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
      });
      expect(value.PAGINATION_DEFAULT_LIMIT).toBe(10);
      expect(value.PAGINATION_MAX_LIMIT).toBe(100);
    });

    it('should reject non-numeric pagination values', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        PAGINATION_DEFAULT_LIMIT: 'many',
      });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('must be a number');
    });
  });

  describe('Logging configuration validation', () => {
    it('should accept valid log levels', () => {
      const validLevels = ['error', 'warn', 'info', 'debug'];

      validLevels.forEach((level) => {
        const { error } = validationSchema.validate({
          DATABASE_URL: 'postgres://localhost/test',
          LOG_LEVEL: level,
        });
        expect(error).toBeUndefined();
      });
    });

    it('should reject invalid log levels', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        LOG_LEVEL: 'trace',
      });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('must be one of');
    });

    it('should use default for LOG_LEVEL', () => {
      const { value } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
      });
      expect(value.LOG_LEVEL).toBe('info');
    });

    it('should accept boolean values for ENABLE_DETAILED_LOGS', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        ENABLE_DETAILED_LOGS: true,
      });
      expect(error).toBeUndefined();
    });

    it('should use default for ENABLE_DETAILED_LOGS', () => {
      const { value } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
      });
      expect(value.ENABLE_DETAILED_LOGS).toBe(false);
    });

    it('should reject non-boolean values for ENABLE_DETAILED_LOGS', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        ENABLE_DETAILED_LOGS: 'yes',
      });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('must be a boolean');
    });
  });

  describe('Feature flags validation', () => {
    it('should accept boolean values for ENABLE_METRICS', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        ENABLE_METRICS: true,
      });
      expect(error).toBeUndefined();
    });

    it('should use default for ENABLE_METRICS', () => {
      const { value } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
      });
      expect(value.ENABLE_METRICS).toBe(false);
    });

    it('should reject non-boolean values for ENABLE_METRICS', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        ENABLE_METRICS: '1',
      });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('must be a boolean');
    });
  });

  describe('Complete configuration validation', () => {
    it('should validate a complete production configuration', () => {
      const productionConfig = {
        NODE_ENV: 'production',
        PORT: 80,
        DATABASE_URL: 'postgresql://user:pass@prod-db:5432/asmovie',
        DB_MAX_CONNECTIONS: 50,
        DB_CONNECTION_TIMEOUT: 10000,
        ALLOWED_ORIGINS: 'https://app.asmovie.com,https://admin.asmovie.com',
        RATE_LIMIT_WINDOW: 900000,
        RATE_LIMIT_MAX: 1000,
        JWT_SECRET:
          'super-secure-production-secret-key-that-is-very-long-and-secure',
        JWT_EXPIRES_IN: '24h',
        SLOW_QUERY_THRESHOLD: 500,
        MAX_MEMORY_USAGE: 52428800, // 50MB
        PAGINATION_DEFAULT_LIMIT: 20,
        PAGINATION_MAX_LIMIT: 200,
        LOG_LEVEL: 'warn',
        ENABLE_DETAILED_LOGS: false,
        ENABLE_METRICS: true,
      };

      const { error, value } = validationSchema.validate(productionConfig);
      expect(error).toBeUndefined();
      expect(value).toEqual(productionConfig);
    });

    it('should validate a minimal configuration with defaults', () => {
      const minimalConfig = {
        DATABASE_URL: 'postgresql://localhost:5432/asmovie_dev',
      };

      const { error, value } = validationSchema.validate(minimalConfig);
      expect(error).toBeUndefined();

      // Should have all default values
      expect(value.NODE_ENV).toBe('development');
      expect(value.PORT).toBe(3001);
      expect(value.DB_MAX_CONNECTIONS).toBe(10);
      expect(value.RATE_LIMIT_WINDOW).toBe(900000);
      expect(value.LOG_LEVEL).toBe('info');
      expect(value.ENABLE_METRICS).toBe(false);
    });

    it('should validate test environment configuration', () => {
      const testConfig = {
        NODE_ENV: 'test',
        DATABASE_URL: 'postgresql://localhost:5432/asmovie_test',
        LOG_LEVEL: 'error',
        ENABLE_DETAILED_LOGS: false,
        ENABLE_METRICS: false,
      };

      const { error } = validationSchema.validate(testConfig);
      expect(error).toBeUndefined();
    });

    it('should provide helpful error messages for multiple validation failures', () => {
      const invalidConfig = {
        NODE_ENV: 'invalid',
        PORT: 'not-a-number',
        LOG_LEVEL: 'trace',
        ENABLE_METRICS: 'maybe',
        JWT_SECRET: 'too-short',
      };

      const { error } = validationSchema.validate(invalidConfig, {
        abortEarly: false,
      });
      expect(error).toBeDefined();
      expect(error?.details.length).toBeGreaterThan(1);

      // Should include various validation errors
      const errorMessages =
        error?.details.map((detail) => detail.message) || [];
      expect(errorMessages.some((msg) => msg.includes('NODE_ENV'))).toBe(true);
      expect(errorMessages.some((msg) => msg.includes('DATABASE_URL'))).toBe(
        true,
      );
    });
  });

  describe('Edge cases and type coercion', () => {
    it('should handle string numbers correctly', () => {
      const { error, value } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        PORT: '3000',
        DB_MAX_CONNECTIONS: '15',
      });

      expect(error).toBeUndefined();
      expect(value.PORT).toBe(3000);
      expect(value.DB_MAX_CONNECTIONS).toBe(15);
    });

    it('should handle boolean strings correctly', () => {
      const { error, value } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        ENABLE_METRICS: 'true',
        ENABLE_DETAILED_LOGS: 'false',
      });

      expect(error).toBeUndefined();
      expect(value.ENABLE_METRICS).toBe(true);
      expect(value.ENABLE_DETAILED_LOGS).toBe(false);
    });

    it('should reject invalid boolean strings', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: 'postgres://localhost/test',
        ENABLE_METRICS: 'yes',
      });

      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('must be a boolean');
    });

    it('should handle empty strings appropriately', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: '',
        LOG_LEVEL: '',
        JWT_SECRET: '',
      });

      expect(error).toBeDefined();
      // Should fail for empty DATABASE_URL
      expect(
        error?.details.some(
          (detail) =>
            detail.path.includes('DATABASE_URL') &&
            detail.message.includes('not allowed to be empty'),
        ),
      ).toBe(true);
    });
  });
});
