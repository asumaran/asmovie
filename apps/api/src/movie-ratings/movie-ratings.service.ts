import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  CreateMovieRatingDto,
  UpdateMovieRatingDto,
} from './dto/movie-rating.dto';

@Injectable()
export class MovieRatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMovieRatingDto: CreateMovieRatingDto) {
    // Verify movie exists
    const movie = await this.prisma.movie.findUnique({
      where: { id: createMovieRatingDto.movieId },
    });

    if (!movie) {
      throw new NotFoundException(
        `Movie with ID ${createMovieRatingDto.movieId} not found`,
      );
    }

    return this.prisma.movieRating.create({
      data: createMovieRatingDto,
      include: {
        movie: true,
      },
    });
  }

  async findAll(movieId?: number) {
    const where = movieId ? { movieId } : {};

    return this.prisma.movieRating.findMany({
      where,
      include: {
        movie: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const rating = await this.prisma.movieRating.findUnique({
      where: { id },
      include: {
        movie: true,
      },
    });

    if (!rating) {
      throw new NotFoundException(`Movie rating with ID ${id} not found`);
    }

    return rating;
  }

  async update(id: number, updateMovieRatingDto: UpdateMovieRatingDto) {
    await this.findOne(id); // Validate rating exists

    return this.prisma.movieRating.update({
      where: { id },
      data: updateMovieRatingDto,
      include: {
        movie: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Validate rating exists

    return this.prisma.movieRating.delete({
      where: { id },
    });
  }

  async getMovieRatings(movieId: number) {
    // Verify movie exists
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    return this.prisma.movieRating.findMany({
      where: { movieId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAverageRating(movieId: number) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    const result = await this.prisma.movieRating.aggregate({
      where: { movieId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return {
      movieId,
      averageRating: result._avg.rating ?? 0,
      totalRatings: result._count.rating,
    };
  }
}
