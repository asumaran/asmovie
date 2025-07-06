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
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  CreateMovieDto,
  UpdateMovieDto,
  AddActorToMovieDto,
  MovieFilterDto,
} from './dto/movie.dto';
import { ApiTokenGuard } from '../common/guards/api-token.guard';

@Controller('movies')
@UseInterceptors(ResponseInterceptor, PerformanceInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @UseGuards(ApiTokenGuard)
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
  @UseGuards(ApiTokenGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @UseGuards(ApiTokenGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.remove(id);
  }

  @Post(':id/actors')
  @UseGuards(ApiTokenGuard)
  addActor(
    @Param('id', ParseIntPipe) id: number,
    @Body() addActorDto: AddActorToMovieDto,
  ) {
    return this.moviesService.addActor(id, addActorDto);
  }

  @Delete(':movieId/actors/:actorId')
  @UseGuards(ApiTokenGuard)
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
