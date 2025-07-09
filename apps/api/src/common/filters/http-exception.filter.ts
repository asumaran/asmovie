import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import {
  BusinessException,
  BusinessExceptionDetails,
} from "../exceptions/business.exception";
import { ApiResponse } from "../dto/api-response.dto";

interface HttpExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

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
    let details: BusinessExceptionDetails | undefined;

    if (exception instanceof BusinessException) {
      status = exception.getStatus();
      const exceptionResponse =
        exception.getResponse() as HttpExceptionResponse;
      message = exceptionResponse.message as string;
      errors = (
        exceptionResponse as unknown as {
          details?: { validationErrors?: string[] };
        }
      ).details?.validationErrors;
      details = (
        exceptionResponse as unknown as { details?: BusinessExceptionDetails }
      ).details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === "object" &&
        exceptionResponse !== null
      ) {
        const response = exceptionResponse as HttpExceptionResponse;
        message = (response.message as string) ?? "Bad Request";
        errors =
          response.message && Array.isArray(response.message)
            ? response.message
            : response.message
              ? [response.message]
              : undefined;
      } else {
        message = "Bad Request";
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Internal server error";
      this.logger.error("Unhandled exception:", exception);
    }

    const errorResponse = ApiResponse.error(message, errors, request.url);
    errorResponse.path = request.url;

    // Add details for business exceptions
    if (details) {
      (
        errorResponse as unknown as { details?: BusinessExceptionDetails }
      ).details = details;
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }
}
