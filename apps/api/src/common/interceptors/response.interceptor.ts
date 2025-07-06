import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiResponse,
  ApiListResponse,
  PaginationMeta,
} from '../dto/api-response.dto';

interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | ApiListResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | ApiListResponse<T>> {
    return next.handle().pipe(
      map((data: unknown) => {
        // If data is already an ApiResponse, return it as is
        if (data instanceof ApiResponse || data instanceof ApiListResponse) {
          return data;
        }

        // If data has a 'data' property and 'meta' property, it's a paginated response
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'meta' in data
        ) {
          const paginatedData = data as PaginatedData<T>;
          return ApiListResponse.success(
            paginatedData.data,
            'Success',
            paginatedData.meta,
          );
        }

        // For regular responses, wrap in ApiResponse
        return ApiResponse.success(data as T, 'Success');
      }),
    );
  }
}
