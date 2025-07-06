import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'API token is required for this operation',
      );
    }

    const apiSecret = this.configService.get<string>('security.apiSecret');
    if (token !== apiSecret) {
      throw new UnauthorizedException('Invalid API token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // Check for token in Authorization header (Bearer token)
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check for token in X-API-Token header
    const apiTokenHeader = request.headers['x-api-token'];
    if (apiTokenHeader) {
      return Array.isArray(apiTokenHeader) ? apiTokenHeader[0] : apiTokenHeader;
    }

    return undefined;
  }
}
