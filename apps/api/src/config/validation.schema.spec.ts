/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { validationSchema } from './validation.schema';

// Base test data that includes required fields
const baseTestData = {
  DATABASE_URL: 'postgres://localhost/test',
  API_SECRET: 'test-api-secret-123',
};

describe('Validation Schema', () => {
  describe('NODE_ENV validation', () => {
    it('should accept valid NODE_ENV values', () => {
      const validValues = ['development', 'production', 'test'];

      validValues.forEach((value) => {
        const { error } = validationSchema.validate({
          ...baseTestData,
          NODE_ENV: value,
        });
        expect(error).toBeUndefined();
      });
    });

    it('should reject invalid NODE_ENV values', () => {
      const { error } = validationSchema.validate({
        ...baseTestData,
        NODE_ENV: 'invalid',
      });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('must be one of');
    });

    it('should use default value for NODE_ENV', () => {
      const { value } = validationSchema.validate(baseTestData);
      expect(value.NODE_ENV).toBe('development');
    });
  });

  describe('PORT validation', () => {
    it('should accept valid port numbers', () => {
      const validPorts = [3000, 3001, 8080, 80, 443];

      validPorts.forEach((port) => {
        const { error } = validationSchema.validate({
          ...baseTestData,
          PORT: port,
        });
        expect(error).toBeUndefined();
      });
    });

    it('should use default value for PORT', () => {
      const { value } = validationSchema.validate(baseTestData);
      expect(value.PORT).toBe(3001);
    });
  });

  describe('DATABASE_URL validation', () => {
    it('should require DATABASE_URL', () => {
      const { error } = validationSchema.validate({
        API_SECRET: 'test-api-secret-123',
      });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('DATABASE_URL');
    });

    it('should accept valid database URLs', () => {
      const validUrls = [
        'postgres://user:pass@localhost:5432/dbname',
        'postgresql://user:pass@localhost:5432/dbname',
        'postgres://localhost/dbname',
        'postgresql://localhost/dbname',
      ];

      validUrls.forEach((url) => {
        const { error } = validationSchema.validate({
          ...baseTestData,
          DATABASE_URL: url,
        });
        expect(error).toBeUndefined();
      });
    });
  });

  describe('DB_MAX_CONNECTIONS validation', () => {
    it('should accept valid connection numbers', () => {
      const validConnections = [5, 10, 20, 50];

      validConnections.forEach((connections) => {
        const { error } = validationSchema.validate({
          ...baseTestData,
          DB_MAX_CONNECTIONS: connections,
        });
        expect(error).toBeUndefined();
      });
    });

    it('should use default value for DB_MAX_CONNECTIONS', () => {
      const { value } = validationSchema.validate(baseTestData);
      expect(value.DB_MAX_CONNECTIONS).toBe(10);
    });
  });

  describe('DB_CONNECTION_TIMEOUT validation', () => {
    it('should accept valid timeout values', () => {
      const validTimeouts = [1000, 5000, 10000, 30000];

      validTimeouts.forEach((timeout) => {
        const { error } = validationSchema.validate({
          ...baseTestData,
          DB_CONNECTION_TIMEOUT: timeout,
        });
        expect(error).toBeUndefined();
      });
    });

    it('should use default value for DB_CONNECTION_TIMEOUT', () => {
      const { value } = validationSchema.validate(baseTestData);
      expect(value.DB_CONNECTION_TIMEOUT).toBe(5000);
    });
  });

  describe('Security configuration validation', () => {
    describe('ALLOWED_ORIGINS', () => {
      it('should accept valid origin strings', () => {
        const validOrigins = [
          'http://localhost:3000',
          'https://example.com',
          'http://localhost:3000,https://example.com',
        ];

        validOrigins.forEach((origin) => {
          const { error } = validationSchema.validate({
            ...baseTestData,
            ALLOWED_ORIGINS: origin,
          });
          expect(error).toBeUndefined();
        });
      });

      it('should be optional', () => {
        const { error } = validationSchema.validate(baseTestData);
        expect(error).toBeUndefined();
      });
    });

    describe('RATE_LIMIT_WINDOW', () => {
      it('should accept valid window values', () => {
        const validWindows = [60000, 900000, 3600000]; // 1min, 15min, 1hour

        validWindows.forEach((window) => {
          const { error } = validationSchema.validate({
            ...baseTestData,
            RATE_LIMIT_WINDOW: window,
          });
          expect(error).toBeUndefined();
        });
      });

      it('should use default value for RATE_LIMIT_WINDOW', () => {
        const { value } = validationSchema.validate(baseTestData);
        expect(value.RATE_LIMIT_WINDOW).toBe(900000);
      });
    });

    describe('RATE_LIMIT_MAX', () => {
      it('should accept valid rate limit values', () => {
        const validLimits = [10, 50, 100, 1000];

        validLimits.forEach((limit) => {
          const { error } = validationSchema.validate({
            ...baseTestData,
            RATE_LIMIT_MAX: limit,
          });
          expect(error).toBeUndefined();
        });
      });

      it('should use default value for RATE_LIMIT_MAX', () => {
        const { value } = validationSchema.validate(baseTestData);
        expect(value.RATE_LIMIT_MAX).toBe(100);
      });
    });

    describe('JWT_SECRET', () => {
      it('should accept valid JWT secrets', () => {
        const validSecrets = [
          'this-is-a-very-long-jwt-secret-key-that-meets-minimum-requirements',
          'another-jwt-secret-that-is-long-enough-for-security',
        ];

        validSecrets.forEach((secret) => {
          const { error } = validationSchema.validate({
            ...baseTestData,
            JWT_SECRET: secret,
          });
          expect(error).toBeUndefined();
        });
      });

      it('should reject JWT secrets that are too short', () => {
        const { error } = validationSchema.validate({
          ...baseTestData,
          JWT_SECRET: 'short',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('length must be at least');
      });

      it('should be optional', () => {
        const { error } = validationSchema.validate(baseTestData);
        expect(error).toBeUndefined();
      });
    });

    describe('JWT_EXPIRES_IN', () => {
      it('should accept valid expiration strings', () => {
        const validExpirations = ['1h', '24h', '7d', '30d'];

        validExpirations.forEach((expiration) => {
          const { error } = validationSchema.validate({
            ...baseTestData,
            JWT_EXPIRES_IN: expiration,
          });
          expect(error).toBeUndefined();
        });
      });

      it('should use default value for JWT_EXPIRES_IN', () => {
        const { value } = validationSchema.validate(baseTestData);
        expect(value.JWT_EXPIRES_IN).toBe('1h');
      });
    });

    describe('API_SECRET', () => {
      it('should require API_SECRET', () => {
        const { error } = validationSchema.validate({
          DATABASE_URL: 'postgres://localhost/test',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('API_SECRET');
      });

      it('should accept valid API_SECRET', () => {
        const { error } = validationSchema.validate(baseTestData);
        expect(error).toBeUndefined();
      });

      it('should reject API_SECRET that is too short', () => {
        const { error } = validationSchema.validate({
          ...baseTestData,
          API_SECRET: 'short',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('length must be at least');
      });
    });
  });

  describe('Performance configuration validation', () => {
    describe('SLOW_QUERY_THRESHOLD', () => {
      it('should accept valid threshold values', () => {
        const validThresholds = [500, 1000, 2000, 5000];

        validThresholds.forEach((threshold) => {
          const { error } = validationSchema.validate({
            ...baseTestData,
            SLOW_QUERY_THRESHOLD: threshold,
          });
          expect(error).toBeUndefined();
        });
      });

      it('should use default value for SLOW_QUERY_THRESHOLD', () => {
        const { value } = validationSchema.validate(baseTestData);
        expect(value.SLOW_QUERY_THRESHOLD).toBe(1000);
      });
    });

    describe('MAX_MEMORY_USAGE', () => {
      it('should accept valid memory values', () => {
        const validMemory = [1048576, 10485760, 52428800]; // 1MB, 10MB, 50MB

        validMemory.forEach((memory) => {
          const { error } = validationSchema.validate({
            ...baseTestData,
            MAX_MEMORY_USAGE: memory,
          });
          expect(error).toBeUndefined();
        });
      });

      it('should use default value for MAX_MEMORY_USAGE', () => {
        const { value } = validationSchema.validate(baseTestData);
        expect(value.MAX_MEMORY_USAGE).toBe(10485760);
      });
    });
  });

  describe('Pagination configuration validation', () => {
    describe('PAGINATION_DEFAULT_LIMIT', () => {
      it('should accept valid default limit values', () => {
        const validLimits = [5, 10, 20, 50];

        validLimits.forEach((limit) => {
          const { error } = validationSchema.validate({
            ...baseTestData,
            PAGINATION_DEFAULT_LIMIT: limit,
          });
          expect(error).toBeUndefined();
        });
      });

      it('should use default value for PAGINATION_DEFAULT_LIMIT', () => {
        const { value } = validationSchema.validate(baseTestData);
        expect(value.PAGINATION_DEFAULT_LIMIT).toBe(10);
      });
    });

    describe('PAGINATION_MAX_LIMIT', () => {
      it('should accept valid max limit values', () => {
        const validMaxLimits = [50, 100, 200, 500];

        validMaxLimits.forEach((limit) => {
          const { error } = validationSchema.validate({
            ...baseTestData,
            PAGINATION_MAX_LIMIT: limit,
          });
          expect(error).toBeUndefined();
        });
      });

      it('should use default value for PAGINATION_MAX_LIMIT', () => {
        const { value } = validationSchema.validate(baseTestData);
        expect(value.PAGINATION_MAX_LIMIT).toBe(100);
      });
    });
  });

  describe('Logging configuration validation', () => {
    describe('LOG_LEVEL', () => {
      it('should accept valid log levels', () => {
        const validLevels = ['error', 'warn', 'info', 'debug'];

        validLevels.forEach((level) => {
          const { error } = validationSchema.validate({
            ...baseTestData,
            LOG_LEVEL: level,
          });
          expect(error).toBeUndefined();
        });
      });

      it('should reject invalid log levels', () => {
        const { error } = validationSchema.validate({
          ...baseTestData,
          LOG_LEVEL: 'invalid',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('must be one of');
      });

      it('should use default value for LOG_LEVEL', () => {
        const { value } = validationSchema.validate(baseTestData);
        expect(value.LOG_LEVEL).toBe('info');
      });
    });

    describe('ENABLE_DETAILED_LOGS', () => {
      it('should accept boolean values', () => {
        [true, false].forEach((value) => {
          const { error } = validationSchema.validate({
            ...baseTestData,
            ENABLE_DETAILED_LOGS: value,
          });
          expect(error).toBeUndefined();
        });
      });

      it('should use default value for ENABLE_DETAILED_LOGS', () => {
        const { value } = validationSchema.validate(baseTestData);
        expect(value.ENABLE_DETAILED_LOGS).toBe(false);
      });
    });
  });

  describe('Feature Flags validation', () => {
    describe('ENABLE_METRICS', () => {
      it('should accept boolean values', () => {
        [true, false].forEach((value) => {
          const { error } = validationSchema.validate({
            ...baseTestData,
            ENABLE_METRICS: value,
          });
          expect(error).toBeUndefined();
        });
      });

      it('should use default value for ENABLE_METRICS', () => {
        const { value } = validationSchema.validate(baseTestData);
        expect(value.ENABLE_METRICS).toBe(false);
      });

      it('should reject non-boolean values for ENABLE_METRICS', () => {
        const { error } = validationSchema.validate({
          DATABASE_URL: 'postgres://localhost/test',
          ENABLE_METRICS: '1',
          API_SECRET: 'test-secret-16chars',
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('must be a boolean');
      });
    });
  });

  describe('Complete configuration validation', () => {
    it('should validate a minimal configuration with defaults', () => {
      const minimalConfig = {
        DATABASE_URL: 'postgres://localhost/test_db',
        API_SECRET: 'test-api-secret-for-development',
      };

      const { error, value } = validationSchema.validate(minimalConfig);
      expect(error).toBeUndefined();

      // Should have all default values
      expect(value.NODE_ENV).toBe('development');
      expect(value.PORT).toBe(3001);
      expect(value.DB_MAX_CONNECTIONS).toBe(10);
      expect(value.DB_CONNECTION_TIMEOUT).toBe(5000);
      expect(value.RATE_LIMIT_WINDOW).toBe(900000);
      expect(value.RATE_LIMIT_MAX).toBe(100);
      expect(value.JWT_EXPIRES_IN).toBe('1h');
      expect(value.SLOW_QUERY_THRESHOLD).toBe(1000);
      expect(value.MAX_MEMORY_USAGE).toBe(10485760);
      expect(value.PAGINATION_DEFAULT_LIMIT).toBe(10);
      expect(value.PAGINATION_MAX_LIMIT).toBe(100);
      expect(value.LOG_LEVEL).toBe('info');
      expect(value.ENABLE_DETAILED_LOGS).toBe(false);
      expect(value.ENABLE_METRICS).toBe(false);
    });

    it('should validate a complete configuration', () => {
      const completeConfig = {
        NODE_ENV: 'production',
        PORT: 8080,
        DATABASE_URL: 'postgres://user:pass@localhost:5432/prod_db',
        DB_MAX_CONNECTIONS: 20,
        DB_CONNECTION_TIMEOUT: 10000,
        ALLOWED_ORIGINS: 'https://example.com,https://www.example.com',
        RATE_LIMIT_WINDOW: 600000,
        RATE_LIMIT_MAX: 200,
        JWT_SECRET: 'production-jwt-secret-key-that-is-very-secure-and-long',
        JWT_EXPIRES_IN: '24h',
        API_SECRET: 'production-api-secret-key',
        SLOW_QUERY_THRESHOLD: 2000,
        MAX_MEMORY_USAGE: 52428800,
        PAGINATION_DEFAULT_LIMIT: 20,
        PAGINATION_MAX_LIMIT: 200,
        LOG_LEVEL: 'warn',
        ENABLE_DETAILED_LOGS: true,
        ENABLE_METRICS: true,
      };

      const { error, value } = validationSchema.validate(completeConfig);
      expect(error).toBeUndefined();
      expect(value).toMatchObject(completeConfig);
    });

    it('should fail validation if required fields are missing', () => {
      const incompleteConfig = {
        NODE_ENV: 'production',
        PORT: 8080,
        // Missing DATABASE_URL and API_SECRET
      };

      const { error } = validationSchema.validate(incompleteConfig);
      expect(error).toBeDefined();
      expect(error?.details).toHaveLength(1); // Joi returns first error by default
      expect(error?.details[0].path).toContain('DATABASE_URL'); // First required field missing
    });

    it('should validate test environment configuration', () => {
      const testConfig = {
        API_SECRET: 'test-secret-16chars',
        DATABASE_URL: 'postgresql://localhost:5432/asmovie_test',
        ENABLE_DETAILED_LOGS: false,
        ENABLE_METRICS: false,
        LOG_LEVEL: 'error',
        NODE_ENV: 'test',
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
        error?.details.map((detail) => detail.message) ?? [];
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
        API_SECRET: 'test-secret-16chars',
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
        API_SECRET: 'test-secret-16chars',
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
        API_SECRET: 'test-secret-16chars',
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
        API_SECRET: '', // Include API_SECRET since it's required
      });

      expect(error).toBeDefined();
      // Should fail for empty DATABASE_URL and API_SECRET
      expect(
        error?.details.some(
          (detail) =>
            detail.path.includes('DATABASE_URL') &&
            detail.message.includes('not allowed to be empty'),
        ),
      ).toBe(true);
    });

    it('should handle whitespace-only strings', () => {
      const { error } = validationSchema.validate({
        DATABASE_URL: '   ',
        API_SECRET: '\t\n  ',
      });

      expect(error).toBeDefined();
      // Should fail validation for whitespace-only strings
      expect(error?.details.length).toBeGreaterThan(0);
    });

    it('should handle large numeric values', () => {
      const { error, value } = validationSchema.validate({
        ...baseTestData,
        PORT: 65535,
        DB_MAX_CONNECTIONS: 1000,
        RATE_LIMIT_MAX: 10000,
        MAX_MEMORY_USAGE: 1073741824, // 1GB
      });

      expect(error).toBeUndefined();
      expect(value.PORT).toBe(65535);
      expect(value.DB_MAX_CONNECTIONS).toBe(1000);
      expect(value.RATE_LIMIT_MAX).toBe(10000);
      expect(value.MAX_MEMORY_USAGE).toBe(1073741824);
    });

    it('should handle special characters in string fields', () => {
      const { error, value } = validationSchema.validate({
        DATABASE_URL:
          'postgres://user:p@ss!word$123@localhost:5432/db-name_test',
        API_SECRET: 'api-secret-with-special-chars!@#$%^&*()',
        JWT_SECRET: 'jwt-secret-with-unicode-chars-äöü-and-numbers-123456789',
        ALLOWED_ORIGINS:
          'https://app.example.com:3000,http://dev.example.com:8080',
      });

      expect(error).toBeUndefined();
      expect(value.DATABASE_URL).toContain('p@ss!word$123');
      expect(value.API_SECRET).toContain('!@#$%^&*()');
      expect(value.JWT_SECRET).toContain('äöü');
      expect(value.ALLOWED_ORIGINS).toContain('https://app.example.com:3000');
    });

    it('should validate against SQL injection patterns in DATABASE_URL', () => {
      const maliciousUrls = [
        "postgres://user'; DROP TABLE users; --@localhost/db",
        'postgres://user" OR 1=1 --@localhost/db',
        'postgres://user/**/OR/**/1=1@localhost/db',
      ];

      maliciousUrls.forEach((url) => {
        const { error } = validationSchema.validate({
          DATABASE_URL: url,
          API_SECRET: 'test-secret-16chars',
        });

        // Schema should still accept these as valid URLs (security is handled at connection level)
        expect(error).toBeUndefined();
      });
    });
  });

  describe('Performance and load testing scenarios', () => {
    it('should handle high-load configuration values', () => {
      const highLoadConfig = {
        ...baseTestData,
        DB_MAX_CONNECTIONS: 500,
        RATE_LIMIT_MAX: 50000,
        RATE_LIMIT_WINDOW: 60000, // 1 minute
        MAX_MEMORY_USAGE: 2147483648, // 2GB
        SLOW_QUERY_THRESHOLD: 100, // Very fast threshold
        PAGINATION_MAX_LIMIT: 1000,
      };

      const { error, value } = validationSchema.validate(highLoadConfig);
      expect(error).toBeUndefined();
      expect(value.DB_MAX_CONNECTIONS).toBe(500);
      expect(value.RATE_LIMIT_MAX).toBe(50000);
      expect(value.MAX_MEMORY_USAGE).toBe(2147483648);
    });

    it('should handle minimal resource configuration', () => {
      const minimalConfig = {
        ...baseTestData,
        DB_MAX_CONNECTIONS: 1,
        RATE_LIMIT_MAX: 1,
        RATE_LIMIT_WINDOW: 1000, // 1 second
        MAX_MEMORY_USAGE: 1048576, // 1MB
        SLOW_QUERY_THRESHOLD: 10000, // 10 seconds
        PAGINATION_DEFAULT_LIMIT: 1,
        PAGINATION_MAX_LIMIT: 5,
      };

      const { error, value } = validationSchema.validate(minimalConfig);
      expect(error).toBeUndefined();
      expect(value.DB_MAX_CONNECTIONS).toBe(1);
      expect(value.PAGINATION_DEFAULT_LIMIT).toBe(1);
    });
  });

  describe('Security validation edge cases', () => {
    it('should accept very long but valid JWT secrets', () => {
      const longSecret = 'a'.repeat(256); // 256 character secret
      const { error, value } = validationSchema.validate({
        ...baseTestData,
        JWT_SECRET: longSecret,
      });

      expect(error).toBeUndefined();
      expect(value.JWT_SECRET).toBe(longSecret);
    });

    it('should accept complex ALLOWED_ORIGINS configurations', () => {
      const complexOrigins = [
        'http://localhost:3000',
        'https://app.example.com',
        'https://admin.example.com:8443',
        'http://127.0.0.1:3001',
        'https://subdomain.domain.co.uk',
      ].join(',');

      const { error, value } = validationSchema.validate({
        ...baseTestData,
        ALLOWED_ORIGINS: complexOrigins,
      });

      expect(error).toBeUndefined();
      expect(value.ALLOWED_ORIGINS).toBe(complexOrigins);
    });

    it('should handle edge cases in JWT expiration values', () => {
      const validExpirations = ['1s', '59m', '23h', '364d', '1y'];

      validExpirations.forEach((expiration) => {
        const { error, value } = validationSchema.validate({
          ...baseTestData,
          JWT_EXPIRES_IN: expiration,
        });

        expect(error).toBeUndefined();
        expect(value.JWT_EXPIRES_IN).toBe(expiration);
      });
    });
  });

  describe('Environment-specific validation scenarios', () => {
    it('should validate typical development environment', () => {
      const devConfig = {
        NODE_ENV: 'development',
        PORT: 3001,
        DATABASE_URL:
          'postgresql://postgres:password@localhost:5432/asmovie_dev',
        API_SECRET: 'dev-api-secret-16chars',
        LOG_LEVEL: 'debug',
        ENABLE_DETAILED_LOGS: true,
        ENABLE_METRICS: false,
        RATE_LIMIT_MAX: 1000,
      };

      const { error } = validationSchema.validate(devConfig);
      expect(error).toBeUndefined();
    });

    it('should validate typical production environment', () => {
      const prodConfig = {
        NODE_ENV: 'production',
        PORT: 443,
        DATABASE_URL:
          'postgresql://prod_user:secure_password@prod-db.internal:5432/asmovie_prod',
        API_SECRET: 'production-api-secret-very-secure-key-2025',
        JWT_SECRET:
          'production-jwt-secret-extremely-secure-and-random-key-with-special-chars-!@#$%',
        LOG_LEVEL: 'warn',
        ENABLE_DETAILED_LOGS: false,
        ENABLE_METRICS: true,
        RATE_LIMIT_MAX: 10000,
        ALLOWED_ORIGINS: 'https://app.example.com,https://admin.example.com',
        DB_MAX_CONNECTIONS: 100,
        MAX_MEMORY_USAGE: 536870912, // 512MB
      };

      const { error } = validationSchema.validate(prodConfig);
      expect(error).toBeUndefined();
    });

    it('should validate typical test environment', () => {
      const testConfig = {
        NODE_ENV: 'test',
        PORT: 0, // Let OS assign port
        DATABASE_URL:
          'postgresql://test_user:test_pass@localhost:5433/asmovie_test',
        API_SECRET: 'test-api-secret-16chars',
        LOG_LEVEL: 'error',
        ENABLE_DETAILED_LOGS: false,
        ENABLE_METRICS: false,
        RATE_LIMIT_MAX: 1000000, // High limit for tests
        DB_MAX_CONNECTIONS: 5, // Lower for test environment
      };

      const { error } = validationSchema.validate(testConfig);
      expect(error).toBeUndefined();
    });
  });
});
