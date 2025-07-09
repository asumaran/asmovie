import { IsEmail, IsString, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";

export class LoginDto {
  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @IsNotEmpty({ message: "Password is required" })
  password: string;
}
