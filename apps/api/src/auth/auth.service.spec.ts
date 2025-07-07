import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { LoginDto } from './dto/login.dto';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUser: UserResponseDto = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should register a new user successfully', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');
      mockConfigService.get.mockReturnValue('1h');

      const result = await service.register(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: 'test@example.com',
      });
      expect(result.user).toBeInstanceOf(Object);
      expect(result.user.id).toEqual(mockUser.id);
      expect(result.user.email).toEqual(mockUser.email);
      expect(result.accessToken).toEqual('jwt-token');
    });

    it('should throw exception if user creation fails', async () => {
      mockUsersService.create.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(service.register(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const userWithPassword = {
      ...mockUser,
      password: 'hashed-password',
    };

    it('should login successfully with valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(userWithPassword);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');
      mockConfigService.get.mockReturnValue('1h');

      const result = await service.login(loginDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(
        userWithPassword,
        'Password123!',
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: 'test@example.com',
      });
      expect(result.user).toBeInstanceOf(Object);
      expect(result.user.id).toEqual(mockUser.id);
      expect(result.user.email).toEqual(mockUser.email);
      expect(result.accessToken).toEqual('jwt-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(userWithPassword);
      mockUsersService.validatePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(
        userWithPassword,
        'Password123!',
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...userWithPassword, isActive: false };
      mockUsersService.findByEmail.mockResolvedValue(inactiveUser);
      mockUsersService.validatePassword.mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(
        inactiveUser,
        'Password123!',
      );
    });
  });

  describe('validateUser', () => {
    const userWithPassword = {
      ...mockUser,
      password: 'hashed-password',
    };

    it('should return user without password if validation succeeds', async () => {
      mockUsersService.findByEmail.mockResolvedValue(userWithPassword);
      mockUsersService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'Password123!',
      );

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(
        userWithPassword,
        'Password123!',
      );
      expect(result).toEqual(userWithPassword);
    });

    it('should return null if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'test@example.com',
        'Password123!',
      );

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(userWithPassword);
      mockUsersService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongPassword',
      );

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(
        userWithPassword,
        'wrongPassword',
      );
      expect(result).toBeNull();
    });

    it('should return null if user is inactive', async () => {
      const inactiveUser = { ...userWithPassword, isActive: false };
      mockUsersService.findByEmail.mockResolvedValue(inactiveUser);
      mockUsersService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'Password123!',
      );

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(
        inactiveUser,
        'Password123!',
      );
      expect(result).toEqual(inactiveUser);
    });
  });
});
