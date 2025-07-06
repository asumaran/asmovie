import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiTokenGuard } from './api-token.guard';

describe('ApiTokenGuard', () => {
  let guard: ApiTokenGuard;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiTokenGuard,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<ApiTokenGuard>(ApiTokenGuard);
    configService = module.get<ConfigService>(ConfigService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigService.get.mockReturnValue('test-api-secret-token');
  });

  const createMockExecutionContext = (
    headers: Record<string, string>,
  ): ExecutionContext => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should return true when valid Bearer token is provided', () => {
      const context = createMockExecutionContext({
        authorization: 'Bearer test-api-secret-token',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(configService.get).toHaveBeenCalledWith('security.apiSecret');
    });

    it('should return true when valid X-API-Token is provided', () => {
      const context = createMockExecutionContext({
        'x-api-token': 'test-api-secret-token',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(configService.get).toHaveBeenCalledWith('security.apiSecret');
    });

    it('should throw UnauthorizedException when no token is provided', () => {
      const context = createMockExecutionContext({});

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'API token is required for this operation',
      );
    });

    it('should throw UnauthorizedException when invalid Bearer token is provided', () => {
      const context = createMockExecutionContext({
        authorization: 'Bearer invalid-token',
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Invalid API token');
    });

    it('should throw UnauthorizedException when invalid X-API-Token is provided', () => {
      const context = createMockExecutionContext({
        'x-api-token': 'invalid-token',
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Invalid API token');
    });

    it('should handle array values for X-API-Token header', () => {
      const headers = { 'x-api-token': 'test-api-secret-token' };
      const context = createMockExecutionContext(headers);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should ignore malformed Authorization header', () => {
      const context = createMockExecutionContext({
        authorization: 'NotBearer test-api-secret-token',
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'API token is required for this operation',
      );
    });

    it('should handle empty Bearer token', () => {
      const context = createMockExecutionContext({
        authorization: 'Bearer ',
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'API token is required for this operation',
      );
    });
  });
});
