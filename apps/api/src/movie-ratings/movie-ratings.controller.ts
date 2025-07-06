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
} from '@nestjs/common';
import { MovieRatingsService } from './movie-ratings.service';
import {
  CreateMovieRatingDto,
  UpdateMovieRatingDto,
} from './dto/movie-rating.dto';

@Controller('movie-ratings')
@UsePipes(new ValidationPipe({ transform: true }))
export class MovieRatingsController {
  constructor(private readonly movieRatingsService: MovieRatingsService) {}

  @Post()
  create(@Body() createMovieRatingDto: CreateMovieRatingDto) {
    return this.movieRatingsService.create(createMovieRatingDto);
  }

  @Get()
  findAll(@Query('movieId', ParseIntPipe) movieId?: number) {
    return this.movieRatingsService.findAll(movieId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movieRatingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieRatingDto: UpdateMovieRatingDto,
  ) {
    return this.movieRatingsService.update(id, updateMovieRatingDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.movieRatingsService.remove(id);
  }

  @Get('movie/:movieId')
  getMovieRatings(@Param('movieId', ParseIntPipe) movieId: number) {
    return this.movieRatingsService.getMovieRatings(movieId);
  }

  @Get('movie/:movieId/average')
  getAverageRating(@Param('movieId', ParseIntPipe) movieId: number) {
    return this.movieRatingsService.getAverageRating(movieId);
  }
}
