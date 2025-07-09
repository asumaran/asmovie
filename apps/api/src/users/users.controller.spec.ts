import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { PrismaService } from "../common/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ChangePasswordDto } from "../auth/dto/change-password.dto";
import { UserResponseDto } from "./dto/user-response.dto";

describe("UsersController", () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue("test-api-secret"),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockUser: UserResponseDto = {
    id: 1,
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
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

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe("create", () => {
    const createUserDto: CreateUserDto = {
      email: "test@example.com",
      password: "Password123!",
      firstName: "Test",
      lastName: "User",
    };

    it("should create a new user", async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe("findAll", () => {
    it("should return array of users", async () => {
      const users = [mockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe("findOne", () => {
    it("should return a user by id", async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(usersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe("update", () => {
    const updateUserDto: UpdateUserDto = {
      firstName: "Updated",
      lastName: "Name",
    };

    it("should update a user", async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateUserDto);

      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe("remove", () => {
    it("should remove a user", async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(usersService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe("changePassword", () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: "currentPassword",
      newPassword: "newPassword123!",
    };

    it("should change password for the authenticated user", async () => {
      const req = { user: { id: 1 } };
      mockUsersService.changePassword.mockResolvedValue(mockUser);

      const result = await controller.changePassword(1, changePasswordDto, req);

      expect(usersService.changePassword).toHaveBeenCalledWith(
        1,
        "currentPassword",
        "newPassword123!",
      );
      expect(result).toEqual(mockUser);
    });

    it("should throw error if user tries to change another user's password", async () => {
      const req = { user: { id: 2 } };

      await expect(
        controller.changePassword(1, changePasswordDto, req),
      ).rejects.toThrow("You can only change your own password");
    });
  });
});
