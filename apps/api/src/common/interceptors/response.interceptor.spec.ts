import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';
import { ApiResponse } from '../dto/api-response.dto';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          url: '/test',
          ip: '127.0.0.1',
        }),
      }),
    } as any;

    mockCallHandler = {
      handle: jest.fn(),
    } as any;
  });

  describe('intercept', () => {
    it('should wrap regular data in ApiResponse', (done) => {
      const testData = { id: 1, name: 'Test' };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toBeInstanceOf(ApiResponse);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(testData);
        expect(result.message).toBe('Success');
        expect(result.timestamp).toBeDefined();
        done();
      });
    });

    it('should return ApiResponse as-is when data is already ApiResponse', (done) => {
      const existingResponse = new ApiResponse({ id: 1 }, 'Custom message');
      mockCallHandler.handle = jest.fn().mockReturnValue(of(existingResponse));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toBe(existingResponse);
        expect(result.message).toBe('Custom message');
        done();
      });
    });

    it('should handle paginated response with data and meta properties', (done) => {
      const paginatedData = {
        data: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(paginatedData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toBeInstanceOf(ApiResponse);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(paginatedData.data);
        expect(result.message).toBe('Success');
        expect((result as any).meta).toEqual(paginatedData.meta);
        done();
      });
    });

    it('should handle null data', (done) => {
      mockCallHandler.handle = jest.fn().mockReturnValue(of(null));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toBeInstanceOf(ApiResponse);
        expect(result.success).toBe(true);
        expect(result.data).toBe(null);
        expect(result.message).toBe('Success');
        done();
      });
    });

    it('should handle undefined data', (done) => {
      mockCallHandler.handle = jest.fn().mockReturnValue(of(undefined));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toBeInstanceOf(ApiResponse);
        expect(result.success).toBe(true);
        expect(result.data).toBe(undefined);
        expect(result.message).toBe('Success');
        done();
      });
    });

    it('should handle empty array', (done) => {
      const emptyArray: any[] = [];
      mockCallHandler.handle = jest.fn().mockReturnValue(of(emptyArray));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toBeInstanceOf(ApiResponse);
        expect(result.success).toBe(true);
        expect(result.data).toEqual([]);
        expect(result.message).toBe('Success');
        done();
      });
    });

    it('should handle complex nested objects', (done) => {
      const complexData = {
        user: {
          id: 1,
          profile: {
            name: 'John',
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
        posts: [
          { id: 1, title: 'Post 1' },
          { id: 2, title: 'Post 2' },
        ],
      };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(complexData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toBeInstanceOf(ApiResponse);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(complexData);
        expect(result.message).toBe('Success');
        done();
      });
    });

    it('should handle string data', (done) => {
      const stringData = 'Simple string response';
      mockCallHandler.handle = jest.fn().mockReturnValue(of(stringData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toBeInstanceOf(ApiResponse);
        expect(result.success).toBe(true);
        expect(result.data).toBe(stringData);
        expect(result.message).toBe('Success');
        done();
      });
    });

    it('should handle number data', (done) => {
      const numberData = 42;
      mockCallHandler.handle = jest.fn().mockReturnValue(of(numberData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toBeInstanceOf(ApiResponse);
        expect(result.success).toBe(true);
        expect(result.data).toBe(numberData);
        expect(result.message).toBe('Success');
        done();
      });
    });

    it('should handle boolean data', (done) => {
      const booleanData = true;
      mockCallHandler.handle = jest.fn().mockReturnValue(of(booleanData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toBeInstanceOf(ApiResponse);
        expect(result.success).toBe(true);
        expect(result.data).toBe(booleanData);
        expect(result.message).toBe('Success');
        done();
      });
    });

    it('should distinguish between paginated response and regular object with data property', (done) => {
      // Object with data property but no meta (should be treated as regular response)
      const objectWithDataProperty = {
        data: 'some value',
        otherProperty: 'other value',
      };
      mockCallHandler.handle = jest
        .fn()
        .mockReturnValue(of(objectWithDataProperty));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toBeInstanceOf(ApiResponse);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(objectWithDataProperty);
        expect(result.message).toBe('Success');
        expect((result as any).meta).toBeUndefined();
        done();
      });
    });

    it('should handle object with meta property but no data property', (done) => {
      const objectWithMetaProperty = {
        meta: { some: 'meta' },
        content: 'some content',
      };
      mockCallHandler.handle = jest
        .fn()
        .mockReturnValue(of(objectWithMetaProperty));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toBeInstanceOf(ApiResponse);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(objectWithMetaProperty);
        expect(result.message).toBe('Success');
        expect((result as any).meta).toBeUndefined();
        done();
      });
    });

    it('should access request from ExecutionContext', () => {
      const testData = { test: true };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
      expect(mockExecutionContext.switchToHttp().getRequest).toHaveBeenCalled();
    });

    it('should preserve timestamp format', (done) => {
      const testData = { id: 1 };
      mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result.timestamp).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        );
        expect(new Date(result.timestamp)).toBeInstanceOf(Date);
        done();
      });
    });
  });
});
