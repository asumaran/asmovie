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
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { PerformanceInterceptor } from '../common/interceptors/performance.interceptor';
import {
  CreateMovieDto,
  UpdateMovieDto,
  AddActorToMovieDto,
  MovieQueryDto,
} from './dto/movie.dto';
import { ApiOrJwtSimpleGuard } from '../common/guards/api-or-jwt-simple.guard';

@Controller('movies')
@UseInterceptors(ResponseInterceptor, PerformanceInterceptor)
@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: false }))
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @UseGuards(ApiOrJwtSimpleGuard)
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Get()
  findAll(@Query() query: MovieQueryDto) {
    const { page, limit, ...filterDto } = query;
    return this.moviesService.findAll(filterDto, page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(ApiOrJwtSimpleGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @UseGuards(ApiOrJwtSimpleGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.remove(id);
  }

  @Post(':id/actors')
  @UseGuards(ApiOrJwtSimpleGuard)
  addActor(
    @Param('id', ParseIntPipe) id: number,
    @Body() addActorDto: AddActorToMovieDto,
  ) {
    return this.moviesService.addActor(id, addActorDto);
  }

  @Delete(':movieId/actors/:actorId')
  @UseGuards(ApiOrJwtSimpleGuard)
  removeActor(
    @Param('movieId', ParseIntPipe) movieId: number,
    @Param('actorId', ParseIntPipe) actorId: number,
  ) {
    return this.moviesService.removeActor(movieId, actorId);
  }

  @Get(':id/actors')
  getActors(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.getActors(id);
  }
}
