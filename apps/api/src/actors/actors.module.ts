import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ActorsController } from "./actors.controller";
import { ActorsService } from "./actors.service";
import { PrismaService } from "../common/prisma.service";
import { QueryBuilderService } from "../common/services/query-builder.service";
import { SharedJwtModule } from "../auth/jwt.module";

@Module({
  imports: [SharedJwtModule, ConfigModule],
  controllers: [ActorsController],
  providers: [ActorsService, PrismaService, QueryBuilderService],
  exports: [ActorsService],
})
export class ActorsModule {}
