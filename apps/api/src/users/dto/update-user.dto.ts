import { PartialType, OmitType } from "@nestjs/mapped-types";
import { IsOptional, IsBoolean } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ["password"] as const),
) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
