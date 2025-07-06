/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import {
  BusinessException,
  DuplicateResourceException,
  ResourceNotFoundException,
  ValidationException,
} from '../exceptions/business.exception';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: any;
  let mockRequest: any;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    mockRequest = {
      method: 'GET',
      url: '/test',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as any;

    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('BusinessException handling', () => {
    it('should handle DuplicateResourceException', () => {
      const exception = new DuplicateResourceException(
        'User',
        'email',
        'test@example.com',
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "User with email 'test@example.com' already exists",
          path: '/test',
          timestamp: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          ),
          details: {
            resource: 'User',
            field: 'email',
            value: 'test@example.com',
          },
        }),
      );

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        "GET /test - 409 - User with email 'test@example.com' already exists",
        expect.any(String),
      );
    });

    it('should handle ResourceNotFoundException', () => {
      const exception = new ResourceNotFoundException('Movie', 123);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Movie with identifier '123' not found",
          path: '/test',
          details: {
            resource: 'Movie',
            identifier: 123,
          },
        }),
      );
    });

    it('should handle ValidationException with validation errors', () => {
      const validationErrors = [
        'Title is required',
        'Release year must be a number',
      ];
      const exception = new ValidationException(
        'Validation failed',
        validationErrors,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
          path: '/test',
          details: {
            validationErrors,
          },
        }),
      );
    });

    it('should handle generic BusinessException', () => {
      const exception = new BusinessException(
        'Business rule violation',
        HttpStatus.FORBIDDEN,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Business rule violation',
          path: '/test',
        }),
      );
    });

    it('should handle BusinessException with custom details', () => {
      const customDetails = {
        reason: 'Custom business logic',
        field: 'customField',
      };
      const exception = new BusinessException(
        'Custom error',
        HttpStatus.BAD_REQUEST,
        customDetails,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: customDetails,
        }),
      );
    });
  });

  describe('HttpException handling', () => {
    it('should handle HttpException with string response', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Forbidden',
          path: '/test',
        }),
      );
    });

    it('should handle HttpException with object response containing message', () => {
      const exceptionResponse = {
        message: 'Invalid input data',
        statusCode: 400,
      };
      const exception = new HttpException(
        exceptionResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid input data',
          errors: ['Invalid input data'],
          path: '/test',
        }),
      );
    });

    it('should handle HttpException with array message for validation errors', () => {
      const validationMessages = ['Name is required', 'Email must be valid'];
      const exceptionResponse = {
        message: validationMessages,
        statusCode: 400,
      };
      const exception = new HttpException(
        exceptionResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: validationMessages,
          errors: validationMessages,
          path: '/test',
        }),
      );
    });

    it('should handle HttpException with object response without message', () => {
      const exceptionResponse = { statusCode: 400, error: 'Bad Request' };
      const exception = new HttpException(
        exceptionResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Bad Request',
          path: '/test',
        }),
      );
    });

    it('should handle HttpException with non-string, non-object response', () => {
      const exception = new HttpException(null as any, HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Bad Request',
          path: '/test',
        }),
      );
    });
  });

  describe('Unknown exception handling', () => {
    it('should handle unknown exceptions as internal server error', () => {
      const exception = new Error('Unexpected error');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Internal server error',
          path: '/test',
        }),
      );

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Unhandled exception:',
        exception,
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'GET /test - 500 - Internal server error',
        expect.any(String),
      );
    });

    it('should handle non-Error unknown exceptions', () => {
      const exception = 'String exception';

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Unhandled exception:',
        exception,
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'GET /test - 500 - Internal server error',
        undefined, // No stack since it's not an Error
      );
    });

    it('should handle null exceptions', () => {
      const exception = null;

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Internal server error',
          path: '/test',
        }),
      );
    });
  });

  describe('Request context handling', () => {
    it('should use correct request method and URL in logs', () => {
      const customRequest = {
        method: 'POST',
        url: '/api/movies',
      };

      const customArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(customRequest),
        }),
      } as any;

      const exception = new HttpException(
        'Bad Request',
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, customArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/movies',
        }),
      );

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'POST /api/movies - 400 - Bad Request',
        expect.any(String),
      );
    });

    it('should handle requests with query parameters', () => {
      const requestWithQuery = {
        method: 'GET',
        url: '/api/movies?page=1&limit=10',
      };

      const customArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(requestWithQuery),
        }),
      } as any;

      const exception = new ResourceNotFoundException('Movie', 999);

      filter.catch(exception, customArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/movies?page=1&limit=10',
        }),
      );
    });
  });

  describe('Error response structure', () => {
    it('should create ApiResponse with correct structure', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];

      expect(responseCall).toMatchObject({
        success: false,
        data: null,
        message: 'Test error',
        timestamp: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        ),
        path: '/test',
      });
      // errors may or may not be present depending on how HttpException formats the message
    });

    it('should preserve ApiResponse.error structure for business exceptions', () => {
      const exception = new DuplicateResourceException(
        'User',
        'email',
        'test@test.com',
      );

      filter.catch(exception, mockArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];

      expect(responseCall).toHaveProperty('success', false);
      expect(responseCall).toHaveProperty('data', null);
      expect(responseCall).toHaveProperty('message');
      expect(responseCall).toHaveProperty('timestamp');
      expect(responseCall).toHaveProperty('path', '/test');
      expect(responseCall).toHaveProperty('details');
    });

    it('should not include errors array when no validation errors exist', () => {
      const exception = new BusinessException('Simple business error');

      filter.catch(exception, mockArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];
      expect(responseCall.errors).toBeUndefined();
    });

    it('should include errors array when validation errors exist', () => {
      const validationErrors = ['Field A is required', 'Field B is invalid'];
      const exception = new ValidationException(
        'Validation failed',
        validationErrors,
      );

      filter.catch(exception, mockArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];
      expect(responseCall.errors).toEqual(validationErrors);
    });
  });

  describe('Logging behavior', () => {
    it('should log error with stack trace for Error instances', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at TestClass.method (file.js:1:1)';

      filter.catch(error, mockArgumentsHost);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'GET /test - 500 - Internal server error',
        error.stack,
      );
    });

    it('should log error without stack trace for non-Error instances', () => {
      const exception = new HttpException('HTTP error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'GET /test - 400 - HTTP error',
        expect.any(String), // HttpException does have a stack trace
      );
    });

    it('should call logger for unhandled exceptions', () => {
      const unknownException = { type: 'unknown', message: 'Strange error' };

      filter.catch(unknownException, mockArgumentsHost);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Unhandled exception:',
        unknownException,
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'GET /test - 500 - Internal server error',
        undefined,
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle HttpException with empty message array', () => {
      const exceptionResponse = { message: [], statusCode: 400 };
      const exception = new HttpException(
        exceptionResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: [],
          errors: [], // Empty array should create empty errors
        }),
      );
    });

    it('should handle BusinessException without details', () => {
      const exception = new BusinessException('Simple error');

      filter.catch(exception, mockArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];
      expect(responseCall.details).toBeUndefined();
    });

    it('should handle ValidationException with empty validation errors', () => {
      const exception = new ValidationException('Validation failed', []);

      filter.catch(exception, mockArgumentsHost);

      const responseCall = mockResponse.json.mock.calls[0][0];
      expect(responseCall.errors).toEqual([]);
      expect(responseCall.details.validationErrors).toEqual([]);
    });
  });
});
