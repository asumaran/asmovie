import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ActorsService } from './actors.service';
import { CreateActorDto, UpdateActorDto, ActorQueryDto } from './dto/actor.dto';
import { ApiOrJwtSimpleGuard } from '../common/guards/api-or-jwt-simple.guard';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { PerformanceInterceptor } from '../common/interceptors/performance.interceptor';

@Controller('actors')
@UseInterceptors(ResponseInterceptor, PerformanceInterceptor)
@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: false }))
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Post()
  @UseGuards(ApiOrJwtSimpleGuard)
  create(@Body() createActorDto: CreateActorDto) {
    return this.actorsService.create(createActorDto);
  }

  @Get()
  findAll(@Query() query: ActorQueryDto) {
    const { page, limit, ...filterDto } = query;
    return this.actorsService.findAll(filterDto, page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.actorsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(ApiOrJwtSimpleGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActorDto: UpdateActorDto,
  ) {
    return this.actorsService.update(id, updateActorDto);
  }

  @Delete(':id')
  @UseGuards(ApiOrJwtSimpleGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.actorsService.remove(id);
  }

  @Get(':id/movies')
  getMovies(@Param('id', ParseIntPipe) id: number) {
    return this.actorsService.getMovies(id);
  }
}
