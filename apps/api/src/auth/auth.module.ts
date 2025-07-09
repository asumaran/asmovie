import { Module, forwardRef } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { SharedJwtModule } from "./jwt.module";

@Module({
  imports: [forwardRef(() => UsersModule), PassportModule, SharedJwtModule],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, SharedJwtModule],
})
export class AuthModule {}
