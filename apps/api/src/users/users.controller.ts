import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Request,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { ChangePasswordDto } from "../auth/dto/change-password.dto";
import { ApiOrJwtSimpleGuard } from "../common/guards/api-or-jwt-simple.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("users")
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(ApiOrJwtSimpleGuard)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(ApiOrJwtSimpleGuard)
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get(":id")
  @UseGuards(ApiOrJwtSimpleGuard)
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(ApiOrJwtSimpleGuard)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @UseGuards(ApiOrJwtSimpleGuard)
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  @Post(":id/change-password")
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Param("id", ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: any,
  ): Promise<UserResponseDto> {
    // Users can only change their own password
    if (req.user.id !== id) {
      throw new Error("You can only change your own password");
    }

    return this.usersService.changePassword(
      id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }
}
