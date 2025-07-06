import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import {
  PerformanceInterceptor,
  DetailedPerformanceInterceptor,
} from './performance.interceptor';

describe('PerformanceInterceptor', () => {
  let interceptor: PerformanceInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let loggerSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new PerformanceInterceptor();

    const mockRequest = {
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'Test Agent',
      },
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as any;

    mockCallHandler = {
      handle: jest.fn(),
    } as any;

    // Mock the logger
    loggerSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    // Mock console.log for metrics collection
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Ensure we're not in test environment for metrics collection
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('intercept', () => {
    it('should log request start and end for successful requests', (done) => {
      const testData = { success: true };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: (data) => {
          expect(data).toEqual(testData);

          // Check that debug log was called for request start
          expect(loggerSpy).toHaveBeenCalledWith(
            '[REQUEST START] GET /test - IP: 127.0.0.1',
          );

          // Check that performance log was called
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringMatching(
              /\[REQUEST END\] GET \/test - \d+ms - SUCCESS/,
            ),
            expect.objectContaining({
              method: 'GET',
              url: '/test',
              duration: expect.stringMatching(/\d+ms/),
              status: 'SUCCESS',
              ip: '127.0.0.1',
              userAgent: 'Test Agent',
              timestamp: expect.stringMatching(
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
              ),
            }),
          );

          done();
        },
      });
    });

    it('should log performance metrics for slow requests', (done) => {
      const testData = { success: true };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      // Mock Date.now to simulate slow request
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        callCount++;
        if (callCount === 1) return 1000; // Start time
        return 3000; // End time (3000ms duration > 1000ms threshold)
      });

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: () => {
          // Check that warn log was called for slow request
          expect(Logger.prototype.warn).toHaveBeenCalledWith(
            expect.stringMatching(
              /\[SLOW REQUEST\] GET \/test - 2000ms - SUCCESS/,
            ),
            expect.objectContaining({
              method: 'GET',
              url: '/test',
              duration: '2000ms',
              status: 'SUCCESS',
              slow: true,
            }),
          );

          Date.now = originalDateNow;
          done();
        },
      });
    });

    it('should log errors with stack trace', (done) => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      mockCallHandler.handle = jest
        .fn()
        .mockReturnValue(throwError(() => error));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        error: () => {
          // Check that error log was called
          expect(Logger.prototype.error).toHaveBeenCalledWith(
            expect.stringMatching(/\[REQUEST ERROR\] GET \/test - \d+ms/),
            expect.objectContaining({
              method: 'GET',
              url: '/test',
              status: 'ERROR',
              error: 'Test error',
              stack: 'Error stack trace',
            }),
          );

          done();
        },
      });
    });

    it('should handle missing user-agent header', (done) => {
      const mockRequestNoUserAgent = {
        method: 'POST',
        url: '/api/test',
        ip: '192.168.1.1',
        headers: {},
      };

      const mockContextNoUserAgent = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequestNoUserAgent),
        }),
      } as any;

      const testData = { result: 'success' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      const result$ = interceptor.intercept(
        mockContextNoUserAgent,
        mockCallHandler,
      );

      result$.subscribe({
        next: () => {
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringMatching(
              /\[REQUEST END\] POST \/api\/test - \d+ms - SUCCESS/,
            ),
            expect.objectContaining({
              userAgent: 'Unknown',
            }),
          );
          done();
        },
      });
    });

    it('should collect metrics with proper endpoint grouping', (done) => {
      const testData = { data: 'test' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      const mockRequestWithQuery = {
        method: 'GET',
        url: '/api/movies?page=1&limit=10',
        ip: '127.0.0.1',
        headers: { 'user-agent': 'Test' },
      };

      const mockContextWithQuery = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequestWithQuery),
        }),
      } as any;

      const result$ = interceptor.intercept(
        mockContextWithQuery,
        mockCallHandler,
      );

      result$.subscribe({
        next: () => {
          // Check that metrics were collected with query params removed
          const loggedMetrics = JSON.parse(consoleLogSpy.mock.calls[0][0]);
          expect(loggedMetrics).toEqual({
            type: 'api_performance_metric',
            endpoint: 'GET /api/movies',
            duration: expect.any(Number),
            status: 'SUCCESS',
            timestamp: expect.stringMatching(
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
            ),
          });
          done();
        },
      });
    });

    it('should not collect metrics in test environment', (done) => {
      // Set test environment
      process.env.NODE_ENV = 'test';

      const testData = { data: 'test' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: () => {
          // Metrics should not be logged in test environment
          expect(consoleLogSpy).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should truncate long user agent strings', (done) => {
      const longUserAgent = 'A'.repeat(200);
      const mockRequestLongUA = {
        method: 'GET',
        url: '/test',
        ip: '127.0.0.1',
        headers: { 'user-agent': longUserAgent },
      };

      const mockContextLongUA = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequestLongUA),
        }),
      } as any;

      const testData = { success: true };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      const result$ = interceptor.intercept(mockContextLongUA, mockCallHandler);

      result$.subscribe({
        next: () => {
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
              userAgent: expect.stringMatching(/^A{100}$/), // Should be truncated to 100 chars
            }),
          );
          done();
        },
      });
    });
  });
});

describe('DetailedPerformanceInterceptor', () => {
  let interceptor: DetailedPerformanceInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new DetailedPerformanceInterceptor();

    const mockRequest = {
      method: 'POST',
      url: '/api/movies',
      body: { title: 'Test Movie' },
      query: { page: '1' },
      params: { id: '123' },
      headers: {
        'user-agent': 'Test Agent',
        'content-type': 'application/json',
      },
    };

    const mockResponse = {
      statusCode: 200,
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as any;

    mockCallHandler = {
      handle: jest.fn(),
    } as any;

    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('intercept', () => {
    it('should log detailed metrics for slow requests', (done) => {
      const testData = { id: 1, title: 'Test Movie' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      // Mock process.hrtime.bigint to simulate slow request
      const originalHrtime = process.hrtime.bigint;
      let callCount = 0;
      process.hrtime.bigint = jest.fn(() => {
        callCount++;
        if (callCount === 1) return BigInt(0); // Start time
        return BigInt(600_000_000); // End time (600ms > 500ms threshold)
      });

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: () => {
          expect(Logger.prototype.warn).toHaveBeenCalledWith(
            '[DETAILED METRICS] SUCCESS',
            expect.objectContaining({
              method: 'POST',
              url: '/api/movies',
              statusCode: 200,
              duration: '600.00ms',
              memoryUsage: expect.objectContaining({
                delta: expect.any(Object),
                current: expect.any(Object),
              }),
              requestSize: expect.any(Number),
              responseSize: expect.any(Number),
              status: 'SUCCESS',
            }),
          );

          process.hrtime.bigint = originalHrtime;
          done();
        },
      });
    });

    it('should log detailed metrics for error requests', (done) => {
      const error = new Error('Database error');
      mockCallHandler.handle = jest
        .fn()
        .mockReturnValue(throwError(() => error));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        error: () => {
          expect(Logger.prototype.warn).toHaveBeenCalledWith(
            '[DETAILED METRICS] ERROR',
            expect.objectContaining({
              status: 'ERROR',
              method: 'POST',
              url: '/api/movies',
            }),
          );
          done();
        },
      });
    });

    it('should warn about high memory usage', (done) => {
      const testData = { data: 'test' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      // Mock memory usage to simulate high memory delta
      const originalMemoryUsage = process.memoryUsage;
      let callCount = 0;
      (process as any).memoryUsage = jest.fn(() => {
        callCount++;
        const baseMemory = {
          rss: 100 * 1024 * 1024,
          heapUsed: 50 * 1024 * 1024,
          heapTotal: 80 * 1024 * 1024,
          external: 10 * 1024 * 1024,
          arrayBuffers: 5 * 1024 * 1024,
        };

        if (callCount === 1) return baseMemory; // Start memory
        return {
          ...baseMemory,
          heapUsed: baseMemory.heapUsed + 15 * 1024 * 1024, // 15MB increase > 10MB threshold
        };
      });

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: () => {
          expect(Logger.prototype.warn).toHaveBeenCalledWith(
            '[MEMORY WARNING] High memory usage detected',
            expect.objectContaining({
              endpoint: 'POST /api/movies',
              memoryDelta: 15 * 1024 * 1024,
              duration: expect.any(Number),
            }),
          );

          process.memoryUsage = originalMemoryUsage;
          done();
        },
      });
    });

    it('should calculate request size correctly', (done) => {
      const testData = { result: 'success' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      // Force a slow request to trigger detailed logging
      const originalHrtime = process.hrtime.bigint;
      let callCount = 0;
      process.hrtime.bigint = jest.fn(() => {
        callCount++;
        if (callCount === 1) return BigInt(0);
        return BigInt(600_000_000); // 600ms
      });

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: () => {
          // The request size should include headers, body, and query parameters
          const logCall = (Logger.prototype.warn as jest.Mock).mock.calls.find(
            (call) => call[0] === '[DETAILED METRICS] SUCCESS',
          );
          expect(logCall[1].requestSize).toBeGreaterThan(0);

          process.hrtime.bigint = originalHrtime;
          done();
        },
      });
    });

    it('should calculate response size correctly', (done) => {
      const testData = {
        id: 1,
        title: 'Large Response',
        description: 'A'.repeat(1000),
        metadata: { tags: ['action', 'drama'], rating: 8.5 },
      };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      // Force a slow request to trigger detailed logging
      const originalHrtime = process.hrtime.bigint;
      let callCount = 0;
      process.hrtime.bigint = jest.fn(() => {
        callCount++;
        if (callCount === 1) return BigInt(0);
        return BigInt(600_000_000); // 600ms
      });

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: () => {
          const logCall = (Logger.prototype.warn as jest.Mock).mock.calls.find(
            (call) => call[0] === '[DETAILED METRICS] SUCCESS',
          );
          expect(logCall[1].responseSize).toBeGreaterThan(1000); // Should be size of JSON.stringify(testData)

          process.hrtime.bigint = originalHrtime;
          done();
        },
      });
    });

    it('should not log detailed metrics for fast requests without errors', (done) => {
      const testData = { success: true };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      // Mock fast request (under 500ms threshold)
      const originalHrtime = process.hrtime.bigint;
      let callCount = 0;
      process.hrtime.bigint = jest.fn(() => {
        callCount++;
        if (callCount === 1) return BigInt(0);
        return BigInt(100_000_000); // 100ms < 500ms threshold
      });

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: () => {
          // Should not log detailed metrics for fast requests
          expect(Logger.prototype.warn).not.toHaveBeenCalledWith(
            '[DETAILED METRICS] SUCCESS',
            expect.any(Object),
          );

          process.hrtime.bigint = originalHrtime;
          done();
        },
      });
    });

    it('should handle requests without body, query, or specific headers', (done) => {
      const minimalRequest = {
        method: 'GET',
        url: '/health',
        headers: {},
      };

      const minimalContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(minimalRequest),
          getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
        }),
      } as any;

      const testData = 'OK';
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      // Force slow request to trigger logging
      const originalHrtime = process.hrtime.bigint;
      let callCount = 0;
      process.hrtime.bigint = jest.fn(() => {
        callCount++;
        if (callCount === 1) return BigInt(0);
        return BigInt(600_000_000);
      });

      const result$ = interceptor.intercept(minimalContext, mockCallHandler);

      result$.subscribe({
        next: () => {
          expect(Logger.prototype.warn).toHaveBeenCalledWith(
            '[DETAILED METRICS] SUCCESS',
            expect.objectContaining({
              method: 'GET',
              url: '/health',
              requestSize: expect.any(Number),
              responseSize: expect.any(Number),
            }),
          );

          process.hrtime.bigint = originalHrtime;
          done();
        },
      });
    });
  });
});
