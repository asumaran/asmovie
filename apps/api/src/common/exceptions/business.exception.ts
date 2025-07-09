import { HttpException, HttpStatus } from '@nestjs/common';

export interface BusinessExceptionDetails {
  [key: string]: unknown;
}

export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: BusinessExceptionDetails,
  ) {
    super(
      {
        error: 'Business Rule Violation',
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

export class DuplicateResourceException extends BusinessException {
  constructor(resource: string, field: string, value: string) {
    super(
      `${resource} with ${field} '${value}' already exists`,
      HttpStatus.CONFLICT,
      {
        resource,
        field,
        value,
      },
    );
  }
}

export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, identifier: string | number) {
    super(
      `${resource} with identifier '${identifier}' not found`,
      HttpStatus.NOT_FOUND,
      {
        resource,
        identifier,
      },
    );
  }
}

export class InvalidRelationshipException extends BusinessException {
  constructor(message: string, details?: BusinessExceptionDetails) {
    super(message, HttpStatus.BAD_REQUEST, details);
  }
}

export class ValidationException extends BusinessException {
  constructor(message: string, validationErrors: string[]) {
    super(message, HttpStatus.BAD_REQUEST, { validationErrors });
  }
}
