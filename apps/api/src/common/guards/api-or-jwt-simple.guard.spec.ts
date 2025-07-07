import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiOrJwtSimpleGuard } from './api-or-jwt-simple.guard';
import { PrismaService } from '../prisma.service';

describe('ApiOrJwtSimpleGuard', () => {
  let guard: ApiOrJwtSimpleGuard;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        headers: {},
        user: undefined,
      }),
    }),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiOrJwtSimpleGuard,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    guard = module.get<ApiOrJwtSimpleGuard>(ApiOrJwtSimpleGuard);

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow access with valid API token in Authorization header', async () => {
      const request = {
        headers: {
          authorization: 'Bearer test-api-secret',
        },
        user: undefined,
      };

      mockConfigService.get.mockReturnValue('test-api-secret');
      mockExecutionContext.switchToHttp().getRequest = jest
        .fn()
        .mockReturnValue(request);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(request.user).toEqual({ type: 'api-token' });
    });

    it('should allow access with valid API token in X-API-Token header', async () => {
      const request = {
        headers: {
          'x-api-token': 'test-api-secret',
        },
        user: undefined,
      };

      mockConfigService.get.mockReturnValue('test-api-secret');
      mockExecutionContext.switchToHttp().getRequest = jest
        .fn()
        .mockReturnValue(request);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(request.user).toEqual({ type: 'api-token' });
    });

    it('should allow access with valid JWT token', async () => {
      const request = {
        headers: {
          authorization: 'Bearer jwt-token',
        },
        user: undefined,
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConfigService.get
        .mockReturnValueOnce('different-api-secret') // API secret doesn't match
        .mockReturnValueOnce('jwt-secret'); // JWT secret

      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 1,
        email: 'test@example.com',
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockExecutionContext.switchToHttp().getRequest = jest
        .fn()
        .mockReturnValue(request);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(request.user).toEqual({
        type: 'jwt',
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(request.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if no token provided', async () => {
      const request = {
        headers: {},
        user: undefined,
      };

      mockExecutionContext.switchToHttp().getRequest = jest
        .fn()
        .mockReturnValue(request);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if API token is invalid', async () => {
      const request = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
        user: undefined,
      };

      mockConfigService.get
        .mockReturnValueOnce('test-api-secret') // API secret doesn't match
        .mockReturnValueOnce('jwt-secret'); // JWT secret

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid JWT'));
      mockExecutionContext.switchToHttp().getRequest = jest
        .fn()
        .mockReturnValue(request);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if JWT token is invalid', async () => {
      const request = {
        headers: {
          authorization: 'Bearer invalid-jwt-token',
        },
        user: undefined,
      };

      mockConfigService.get
        .mockReturnValueOnce('different-api-secret') // API secret doesn't match
        .mockReturnValueOnce('jwt-secret'); // JWT secret

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid JWT'));
      mockExecutionContext.switchToHttp().getRequest = jest
        .fn()
        .mockReturnValue(request);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user from JWT is not found', async () => {
      const request = {
        headers: {
          authorization: 'Bearer jwt-token',
        },
        user: undefined,
      };

      mockConfigService.get
        .mockReturnValueOnce('different-api-secret') // API secret doesn't match
        .mockReturnValueOnce('jwt-secret'); // JWT secret

      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 1,
        email: 'test@example.com',
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockExecutionContext.switchToHttp().getRequest = jest
        .fn()
        .mockReturnValue(request);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user from JWT is inactive', async () => {
      const request = {
        headers: {
          authorization: 'Bearer jwt-token',
        },
        user: undefined,
      };

      const inactiveUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockConfigService.get
        .mockReturnValueOnce('different-api-secret') // API secret doesn't match
        .mockReturnValueOnce('jwt-secret'); // JWT secret

      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 1,
        email: 'test@example.com',
      });
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);
      mockExecutionContext.switchToHttp().getRequest = jest
        .fn()
        .mockReturnValue(request);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
