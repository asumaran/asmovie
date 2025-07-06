import { Module } from '@nestjs/common';
import { ActorsController } from './actors.controller';
import { ActorsService } from './actors.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [ActorsController],
  providers: [ActorsService, PrismaService],
  exports: [ActorsService],
})
export class ActorsModule {}
