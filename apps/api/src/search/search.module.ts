import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { PrismaService } from '../common/prisma.service';
import { QueryBuilderService } from '../common/services/query-builder.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, PrismaService, QueryBuilderService],
})
export class SearchModule {}
