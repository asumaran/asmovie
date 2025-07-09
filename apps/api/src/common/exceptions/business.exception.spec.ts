import { HttpStatus } from '@nestjs/common';
import {
  BusinessException,
  DuplicateResourceException,
  ResourceNotFoundException,
  InvalidRelationshipException,
  ValidationException,
  BusinessExceptionDetails,
} from './business.exception';

interface BusinessExceptionResponse {
  error: string;
  message: string;
  timestamp: string;
  details?: BusinessExceptionDetails;
}

describe('Business Exceptions', () => {
  describe('BusinessException', () => {
    it('should create exception with default status code', () => {
      const message = 'Business rule violation';
      const exception = new BusinessException(message);

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toBe(message);

      const response = exception.getResponse() as BusinessExceptionResponse;
      expect(response.error).toBe('Business Rule Violation');
      expect(response.message).toBe(message);
      expect(response.timestamp).toBeDefined();
      expect(response.details).toBeUndefined();
    });

    it('should create exception with custom status code', () => {
      const message = 'Unauthorized operation';
      const exception = new BusinessException(message, HttpStatus.UNAUTHORIZED);

      expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      expect(exception.message).toBe(message);
    });

    it('should create exception with details', () => {
      const message = 'Business rule violation';
      const details = { field: 'value', reason: 'invalid' };
      const exception = new BusinessException(
        message,
        HttpStatus.BAD_REQUEST,
        details,
      );

      const response = exception.getResponse() as BusinessExceptionResponse;
      expect(response.details).toEqual(details);
    });

    it('should include timestamp in response', () => {
      const exception = new BusinessException('Test');
      const response = exception.getResponse() as BusinessExceptionResponse;

      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('DuplicateResourceException', () => {
    it('should create exception with proper message and details', () => {
      const resource = 'User';
      const field = 'email';
      const value = 'test@example.com';

      const exception = new DuplicateResourceException(resource, field, value);

      expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
      expect(exception.message).toBe(
        `${resource} with ${field} '${value}' already exists`,
      );

      const response = exception.getResponse() as BusinessExceptionResponse;
      expect(response.error).toBe('Business Rule Violation');
      expect(response.details).toEqual({ resource, field, value });
    });

    it('should handle special characters in values', () => {
      const exception = new DuplicateResourceException(
        'Movie',
        'title',
        'Test "Movie" #1',
      );

      expect(exception.message).toBe(
        'Movie with title \'Test "Movie" #1\' already exists',
      );
    });
  });

  describe('ResourceNotFoundException', () => {
    it('should create exception with string identifier', () => {
      const resource = 'Movie';
      const identifier = '123';

      const exception = new ResourceNotFoundException(resource, identifier);

      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.message).toBe(
        `${resource} with identifier '${identifier}' not found`,
      );

      const response = exception.getResponse() as BusinessExceptionResponse;
      expect(response.details).toEqual({ resource, identifier });
    });

    it('should create exception with numeric identifier', () => {
      const resource = 'Actor';
      const identifier = 456;

      const exception = new ResourceNotFoundException(resource, identifier);

      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.message).toBe(
        `${resource} with identifier '${identifier}' not found`,
      );

      const response = exception.getResponse() as BusinessExceptionResponse;
      expect(response.details).toEqual({ resource, identifier });
    });

    it('should handle complex identifiers', () => {
      const resource = 'MovieActor';
      const identifier = 'movieId:1, actorId:2';

      const exception = new ResourceNotFoundException(resource, identifier);

      expect(exception.message).toBe(
        `${resource} with identifier '${identifier}' not found`,
      );
    });
  });

  describe('InvalidRelationshipException', () => {
    it('should create exception with default status', () => {
      const message = 'Invalid relationship between entities';

      const exception = new InvalidRelationshipException(message);

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toBe(message);

      const response = exception.getResponse() as BusinessExceptionResponse;
      expect(response.error).toBe('Business Rule Violation');
    });

    it('should create exception with details', () => {
      const message = 'Cannot relate these entities';
      const details = {
        sourceEntity: 'Movie',
        targetEntity: 'Actor',
        reason: 'Already exists',
      };

      const exception = new InvalidRelationshipException(message, details);

      const response = exception.getResponse() as BusinessExceptionResponse;
      expect(response.details).toEqual(details);
    });
  });

  describe('ValidationException', () => {
    it('should create exception with validation errors', () => {
      const message = 'Validation failed';
      const validationErrors = [
        'Title is required',
        'Release year must be a number',
        'Duration must be positive',
      ];

      const exception = new ValidationException(message, validationErrors);

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toBe(message);

      const response = exception.getResponse() as BusinessExceptionResponse;
      expect(response.details?.validationErrors).toEqual(validationErrors);
    });

    it('should handle empty validation errors array', () => {
      const message = 'Validation failed';
      const validationErrors: string[] = [];

      const exception = new ValidationException(message, validationErrors);

      const response = exception.getResponse() as BusinessExceptionResponse;
      expect(response.details?.validationErrors).toEqual([]);
    });

    it('should handle single validation error', () => {
      const message = 'Validation failed';
      const validationErrors = ['Required field missing'];

      const exception = new ValidationException(message, validationErrors);

      const response = exception.getResponse() as BusinessExceptionResponse;
      expect(response.details?.validationErrors).toEqual(validationErrors);
    });
  });

  describe('Exception inheritance', () => {
    it('should properly inherit from BusinessException', () => {
      const duplicateException = new DuplicateResourceException(
        'User',
        'email',
        'test@test.com',
      );
      const notFoundException = new ResourceNotFoundException('Movie', 1);
      const relationshipException = new InvalidRelationshipException(
        'Invalid relation',
      );
      const validationException = new ValidationException('Validation failed', [
        'Error',
      ]);

      expect(duplicateException).toBeInstanceOf(BusinessException);
      expect(notFoundException).toBeInstanceOf(BusinessException);
      expect(relationshipException).toBeInstanceOf(BusinessException);
      expect(validationException).toBeInstanceOf(BusinessException);
    });

    it('should have consistent error structure across all exceptions', () => {
      const exceptions = [
        new DuplicateResourceException('User', 'email', 'test@test.com'),
        new ResourceNotFoundException('Movie', 1),
        new InvalidRelationshipException('Invalid relation'),
        new ValidationException('Validation failed', ['Error']),
      ];

      exceptions.forEach((exception) => {
        const response = exception.getResponse() as BusinessExceptionResponse;
        expect(response).toHaveProperty('error', 'Business Rule Violation');
        expect(response).toHaveProperty('message');
        expect(response).toHaveProperty('timestamp');
        expect(typeof response.timestamp).toBe('string');
      });
    });
  });

  describe('Error response structure', () => {
    it('should have consistent timestamp format', () => {
      const exception = new BusinessException('Test message');
      const response = exception.getResponse() as BusinessExceptionResponse;

      // Should be valid ISO string
      expect(() => new Date(response.timestamp)).not.toThrow();
      expect(response.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it('should preserve all error information', () => {
      const message = 'Custom error message';
      const details = { customField: 'customValue' };

      const exception = new BusinessException(
        message,
        HttpStatus.FORBIDDEN,
        details,
      );
      const response = exception.getResponse() as BusinessExceptionResponse;

      expect(response.error).toBe('Business Rule Violation');
      expect(response.message).toBe(message);
      expect(response.details).toEqual(details);
      expect(response.timestamp).toBeDefined();
    });
  });
});
