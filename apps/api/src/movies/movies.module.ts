import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { PrismaService } from '../common/prisma.service';
import { QueryBuilderService } from '../common/services/query-builder.service';
import { TransactionService } from '../common/services/transaction.service';

@Module({
  controllers: [MoviesController],
  providers: [
    MoviesService,
    PrismaService,
    QueryBuilderService,
    TransactionService,
  ],
  exports: [MoviesService],
})
export class MoviesModule {}
