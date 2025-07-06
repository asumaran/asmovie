import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/api-response.dto';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        // If data is already an ApiResponse, return it as is
        if (data instanceof ApiResponse) {
          return data;
        }

        // If data has a 'data' property and 'meta' property, it's a paginated response
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'meta' in data
        ) {
          const response = new ApiResponse(data.data, 'Success');
          (response as any).meta = data.meta;
          return response;
        }

        // For regular responses, wrap in ApiResponse
        return ApiResponse.success(data, 'Success');
      }),
    );
  }
}
