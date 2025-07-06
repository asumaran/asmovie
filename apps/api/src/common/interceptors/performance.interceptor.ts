import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private readonly slowQueryThreshold = 1000; // 1 second

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const startTime = Date.now();

    // Log request start
    this.logger.debug(`[REQUEST START] ${method} ${url} - IP: ${ip}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logPerformance(method, url, duration, 'SUCCESS', ip, userAgent);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logPerformance(
            method,
            url,
            duration,
            'ERROR',
            ip,
            userAgent,
            error,
          );
        },
      }),
    );
  }

  private logPerformance(
    method: string,
    url: string,
    duration: number,
    status: 'SUCCESS' | 'ERROR',
    ip: string,
    userAgent: string,
    error?: any,
  ): void {
    const logData = {
      method,
      url,
      duration: `${duration}ms`,
      status,
      ip,
      userAgent: userAgent.substring(0, 100), // Truncate long user agents
      timestamp: new Date().toISOString(),
    };

    // Log slow queries as warnings
    if (duration > this.slowQueryThreshold) {
      this.logger.warn(
        `[SLOW REQUEST] ${method} ${url} - ${duration}ms - ${status}`,
        { ...logData, slow: true },
      );
    } else {
      this.logger.log(
        `[REQUEST END] ${method} ${url} - ${duration}ms - ${status}`,
        logData,
      );
    }

    // Log errors with stack trace
    if (status === 'ERROR' && error) {
      this.logger.error(`[REQUEST ERROR] ${method} ${url} - ${duration}ms`, {
        ...logData,
        error: error.message,
        stack: error.stack,
      });
    }

    // Performance metrics collection (could be sent to monitoring service)
    this.collectMetrics(method, url, duration, status);
  }

  private collectMetrics(
    method: string,
    url: string,
    duration: number,
    status: 'SUCCESS' | 'ERROR',
  ): void {
    // Here you could send metrics to external monitoring services like:
    // - Prometheus
    // - DataDog
    // - New Relic
    // - Custom analytics service

    // Example: Simple in-memory metrics (replace with real implementation)
    const endpoint = `${method} ${url.split('?')[0]}`; // Remove query params for grouping

    // Store metrics in a way that could be exported
    // This is a placeholder for real metrics collection
    if (process.env.NODE_ENV !== 'test') {
      console.log(
        JSON.stringify({
          type: 'api_performance_metric',
          endpoint,
          duration,
          status,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}

@Injectable()
export class DetailedPerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DetailedPerformanceInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, query, params, headers } = request;

    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logDetailedMetrics(
            request,
            response,
            startTime,
            startMemory,
            'SUCCESS',
            data,
          );
        },
        error: (error) => {
          this.logDetailedMetrics(
            request,
            response,
            startTime,
            startMemory,
            'ERROR',
            null,
            error,
          );
        },
      }),
    );
  }

  private logDetailedMetrics(
    request: any,
    response: any,
    startTime: bigint,
    startMemory: NodeJS.MemoryUsage,
    status: 'SUCCESS' | 'ERROR',
    responseData?: any,
    error?: any,
  ): void {
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();

    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const memoryDelta = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external,
    };

    const metrics = {
      method: request.method,
      url: request.url,
      statusCode: response.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      memoryUsage: {
        delta: memoryDelta,
        current: endMemory,
      },
      requestSize: this.calculateRequestSize(request),
      responseSize: this.calculateResponseSize(responseData),
      userAgent: request.headers['user-agent'],
      contentType: request.headers['content-type'],
      status,
      timestamp: new Date().toISOString(),
    };

    // Only log detailed metrics for slow requests or errors
    if (duration > 500 || status === 'ERROR') {
      this.logger.warn(`[DETAILED METRICS] ${status}`, metrics);
    }

    // Log memory leaks
    if (memoryDelta.heapUsed > 10 * 1024 * 1024) {
      // 10MB threshold
      this.logger.warn(`[MEMORY WARNING] High memory usage detected`, {
        endpoint: `${request.method} ${request.url}`,
        memoryDelta: memoryDelta.heapUsed,
        duration,
      });
    }
  }

  private calculateRequestSize(request: any): number {
    let size = 0;

    // Calculate headers size
    if (request.headers) {
      size += JSON.stringify(request.headers).length;
    }

    // Calculate body size
    if (request.body) {
      size += JSON.stringify(request.body).length;
    }

    // Calculate query parameters size
    if (request.query) {
      size += JSON.stringify(request.query).length;
    }

    return size;
  }

  private calculateResponseSize(data: any): number {
    if (!data) return 0;
    return JSON.stringify(data).length;
  }
}
