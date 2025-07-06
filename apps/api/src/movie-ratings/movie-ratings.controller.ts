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
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { MovieRatingsService } from './movie-ratings.service';
import {
  CreateMovieRatingDto,
  UpdateMovieRatingDto,
} from './dto/movie-rating.dto';
import { ApiTokenGuard } from '../common/guards/api-token.guard';

@Controller('movie-ratings')
@UsePipes(new ValidationPipe({ transform: true }))
export class MovieRatingsController {
  constructor(private readonly movieRatingsService: MovieRatingsService) {}

  @Post()
  @UseGuards(ApiTokenGuard)
  create(@Body() createMovieRatingDto: CreateMovieRatingDto) {
    return this.movieRatingsService.create(createMovieRatingDto);
  }

  @Get()
  findAll(@Query('movieId') movieId?: string) {
    let parsedMovieId: number | undefined;

    if (movieId !== undefined) {
      parsedMovieId = parseInt(movieId, 10);
      if (isNaN(parsedMovieId)) {
        throw new BadRequestException('movieId must be a valid number');
      }
    }

    return this.movieRatingsService.findAll(parsedMovieId);
  }

  @Get('movie/:movieId/average')
  getAverageRating(@Param('movieId', ParseIntPipe) movieId: number) {
    return this.movieRatingsService.getAverageRating(movieId);
  }

  @Get('movie/:movieId')
  getMovieRatings(@Param('movieId', ParseIntPipe) movieId: number) {
    return this.movieRatingsService.getMovieRatings(movieId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movieRatingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(ApiTokenGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieRatingDto: UpdateMovieRatingDto,
  ) {
    return this.movieRatingsService.update(id, updateMovieRatingDto);
  }

  @Delete(':id')
  @UseGuards(ApiTokenGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.movieRatingsService.remove(id);
  }
}
