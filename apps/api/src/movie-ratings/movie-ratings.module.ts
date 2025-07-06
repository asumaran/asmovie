import { Module } from '@nestjs/common';
import { MovieRatingsController } from './movie-ratings.controller';
import { MovieRatingsService } from './movie-ratings.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [MovieRatingsController],
  providers: [MovieRatingsService, PrismaService],
  exports: [MovieRatingsService],
})
export class MovieRatingsModule {}
