import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from '../exceptions/business.exception';
import { ApiResponse } from '../dto/api-response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let errors: string[] | undefined;
    let details: any;

    if (exception instanceof BusinessException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      message = exceptionResponse.message;
      errors = exceptionResponse.details?.validationErrors;
      details = exceptionResponse.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        message = (exceptionResponse as any).message || 'Bad Request';
        errors =
          (exceptionResponse as any).message?.length > 0
            ? Array.isArray((exceptionResponse as any).message)
              ? (exceptionResponse as any).message
              : [(exceptionResponse as any).message]
            : undefined;
      } else {
        message = 'Bad Request';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      this.logger.error('Unhandled exception:', exception);
    }

    const errorResponse = ApiResponse.error(message, errors, request.url);
    errorResponse.path = request.url;

    // Add details for business exceptions
    if (details) {
      (errorResponse as any).details = details;
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }
}
