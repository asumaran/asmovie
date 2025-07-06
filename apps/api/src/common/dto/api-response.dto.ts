export class ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;
  path?: string;

  constructor(data?: T, message?: string, success = true) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(data, message, true);
  }

  static error(
    message: string,
    errors?: string[],
    path?: string,
  ): ApiResponse<null> {
    const response = new ApiResponse(null, message, false);
    response.errors = errors;
    response.path = path;
    return response;
  }
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class ApiListResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
  meta?: PaginationMeta;
  timestamp: string;

  constructor(data: T[], message?: string, meta?: PaginationMeta) {
    this.success = true;
    this.data = data;
    this.message = message;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(
    data: T[],
    message?: string,
    meta?: PaginationMeta,
  ): ApiListResponse<T> {
    return new ApiListResponse(data, message, meta);
  }
}
