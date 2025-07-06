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
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { PerformanceInterceptor } from '../common/interceptors/performance.interceptor';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  CreateMovieDto,
  UpdateMovieDto,
  AddActorToMovieDto,
  MovieFilterDto,
} from './dto/movie.dto';

@Controller('movies')
@UseInterceptors(ResponseInterceptor, PerformanceInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: MovieFilterDto,
  ) {
    return this.moviesService.findAll(
      filterDto,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.remove(id);
  }

  @Post(':id/actors')
  addActor(
    @Param('id', ParseIntPipe) id: number,
    @Body() addActorDto: AddActorToMovieDto,
  ) {
    return this.moviesService.addActor(id, addActorDto);
  }

  @Delete(':movieId/actors/:actorId')
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
