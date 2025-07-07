import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  DuplicateResourceException,
  ResourceNotFoundException,
} from '../common/exceptions/business.exception';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new DuplicateResourceException(
        'User',
        'email',
        createUserDto.email,
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    return new UserResponseDto(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => new UserResponseDto(user));
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new ResourceNotFoundException('User', id);
    }

    return new UserResponseDto(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const existingUser = await this.findOne(id);

    // Check for email conflicts
    if (updateUserDto.email) {
      const conflictUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (conflictUser && conflictUser.id !== id) {
        throw new DuplicateResourceException(
          'User',
          'email',
          updateUserDto.email,
        );
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return new UserResponseDto(updatedUser);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Ensure user exists

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new ResourceNotFoundException('User', id);
    }

    const isCurrentPasswordValid = await this.validatePassword(
      user,
      currentPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    return new UserResponseDto(updatedUser);
  }
}
