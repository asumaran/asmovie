import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { PerformanceInterceptor } from '../common/interceptors/performance.interceptor';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResponseDto } from './dto/search-response.dto';

@Controller('search')
@UseInterceptors(ResponseInterceptor, PerformanceInterceptor)
@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: false }))
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query() query: SearchQueryDto): Promise<SearchResponseDto> {
    return this.searchService.search(query);
  }
}
