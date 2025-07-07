import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class ApiOrJwtGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Authentication is required. Provide either an API token or JWT token.',
      );
    }

    // Try API token first
    const apiSecret = this.configService.get<string>('security.apiSecret');
    if (token === apiSecret) {
      // Valid API token
      request.user = { type: 'api-token' };
      return true;
    }

    // Try JWT token
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('security.jwtSecret'),
      });

      // Validate user exists and is active
      const user = await this.authService.validateUserById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid or inactive user');
      }

      // Attach user to request
      request.user = { type: 'jwt', ...user };
      return true;
    } catch {
      // Neither API token nor JWT token worked
      throw new UnauthorizedException(
        'Invalid authentication token. Provide a valid API token or JWT token.',
      );
    }
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
