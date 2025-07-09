import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { PrismaService } from "../prisma.service";

@Injectable()
export class ApiOrJwtSimpleGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        "Authentication is required. Provide either an API token or JWT token.",
      );
    }

    // Try API token first
    const apiSecret = this.configService.get<string>("security.apiSecret");
    if (token === apiSecret) {
      // Valid API token
      request.user = { type: "api-token" };
      return true;
    }

    // Try JWT token
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>("security.jwtSecret"),
      });

      // Validate user exists and is active
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user?.isActive) {
        throw new UnauthorizedException("Invalid or inactive user");
      }

      // Attach user to request (without password)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      request.user = { type: "jwt", ...userWithoutPassword };
      return true;
    } catch {
      // Neither API token nor JWT token worked
      throw new UnauthorizedException(
        "Invalid authentication token. Provide a valid API token or JWT token.",
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // Check for token in Authorization header (Bearer token)
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    // Check for token in X-API-Token header
    const apiTokenHeader = request.headers["x-api-token"];
    if (apiTokenHeader) {
      return Array.isArray(apiTokenHeader) ? apiTokenHeader[0] : apiTokenHeader;
    }

    return undefined;
  }
}
