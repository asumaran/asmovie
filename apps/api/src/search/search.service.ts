import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import { QueryBuilderService } from '../common/services/query-builder.service';
import {
  PaginatedResponse,
  PaginationHelper,
} from '../common/interfaces/paginated-response.interface';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchItemDto } from './dto/search-response.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
    private readonly configService: ConfigService,
  ) {}

  async search(
    query: SearchQueryDto,
  ): Promise<PaginatedResponse<SearchItemDto>> {
    const { q, sortBy, sortOrder, page = 1, limit = 10 } = query;

    // Always search both movies and actors
    const movieResults = await this.searchMovies(q, sortBy, sortOrder, 1, 1000);
    const actorResults = await this.searchActors(q, sortBy, sortOrder, 1, 1000);

    const allResults = [...movieResults.data, ...actorResults.data];
    const total = movieResults.total + actorResults.total;

    const sortedResults = this.sortResults(allResults, sortBy, sortOrder);
    const paginatedResults = this.paginateResults(sortedResults, page, limit);

    const meta = PaginationHelper.createMeta(page, limit, total);
    return PaginationHelper.createResponse(paginatedResults, meta);
  }

  private async searchMovies(
    query: string,
    sortBy?: string,
    sortOrder?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: SearchItemDto[]; total: number }> {
    const where = {
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
        { plot: { contains: query, mode: 'insensitive' as const } },
        { genre: { contains: query, mode: 'insensitive' as const } },
        { director: { contains: query, mode: 'insensitive' as const } },
        { writers: { contains: query, mode: 'insensitive' as const } },
        { awards: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    const include = {
      actors: {
        include: {
          actor: true,
        },
      },
      ratings: true,
    };

    const orderBy = this.buildMovieOrderBy(sortBy, sortOrder);

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        include,
        orderBy,
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.prisma.movie.count({ where }),
    ]);

    const data = movies.map((movie) => ({
      id: movie.id,
      type: 'movie' as const,
      title: movie.title,
      description: movie.description || undefined,
      plot: movie.plot || undefined,
      releaseYear: movie.releaseYear,
      genre: movie.genre,
      duration: movie.duration,
      budget: movie.budget ? Number(movie.budget) : undefined,
      boxOffice: movie.boxOffice ? Number(movie.boxOffice) : undefined,
      awards: movie.awards || undefined,
      writers: movie.writers || undefined,
      director: movie.director || undefined,
      averageRating:
        movie.ratings && movie.ratings.length > 0
          ? movie.ratings.reduce((sum, rating) => sum + rating.rating, 0) /
            movie.ratings.length
          : undefined,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
      actors: movie.actors
        ? movie.actors.map((movieActor) => ({
            id: movieActor.actor.id,
            name: movieActor.actor.name,
            role: movieActor.role,
          }))
        : [],
    }));

    return { data, total };
  }

  private async searchActors(
    query: string,
    sortBy?: string,
    sortOrder?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: SearchItemDto[]; total: number }> {
    const where = {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { biography: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    const include = {
      movies: {
        include: {
          movie: true,
        },
      },
    };

    const orderBy = this.buildActorOrderBy(sortBy, sortOrder);

    const [actors, total] = await Promise.all([
      this.prisma.actor.findMany({
        where,
        include,
        orderBy,
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.prisma.actor.count({ where }),
    ]);

    const data = actors.map((actor) => ({
      id: actor.id,
      type: 'actor' as const,
      name: actor.name,
      biography: actor.biography || undefined,
      birthDate: actor.birthDate || undefined,
      createdAt: actor.createdAt,
      updatedAt: actor.updatedAt,
      movies: actor.movies
        ? actor.movies.map((movieActor) => ({
            id: movieActor.movie.id,
            title: movieActor.movie.title,
            role: movieActor.role,
          }))
        : [],
    }));

    return { data, total };
  }

  private buildMovieOrderBy(sortBy?: string, sortOrder?: string) {
    const order = sortOrder === 'desc' ? 'desc' : 'asc';

    switch (sortBy) {
      case 'title':
        return { title: order };
      case 'releaseYear':
        return { releaseYear: order };
      case 'rating':
        return { ratings: { _count: order } };
      case 'director':
        return { director: order };
      case 'budget':
        return { budget: order };
      case 'boxOffice':
        return { boxOffice: order };
      case 'createdAt':
        return { createdAt: order };
      default:
        return { createdAt: 'desc' as const };
    }
  }

  private buildActorOrderBy(sortBy?: string, sortOrder?: string) {
    const order = sortOrder === 'desc' ? 'desc' : 'asc';

    switch (sortBy) {
      case 'name':
        return { name: order };
      case 'createdAt':
        return { createdAt: order };
      default:
        return { createdAt: 'desc' as const };
    }
  }

  private sortResults(
    results: SearchItemDto[],
    sortBy?: string,
    sortOrder?: string,
  ): SearchItemDto[] {
    if (!sortBy) return results;

    const order = sortOrder === 'desc' ? -1 : 1;

    return results.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title || a.name;
          bValue = b.title || b.name;
          break;
        case 'name':
          aValue = a.name || a.title;
          bValue = b.name || b.title;
          break;
        case 'rating':
          aValue = a.averageRating || 0;
          bValue = b.averageRating || 0;
          break;
        case 'releaseYear':
          aValue = a.releaseYear || 0;
          bValue = b.releaseYear || 0;
          break;
        case 'director':
          aValue = a.director || '';
          bValue = b.director || '';
          break;
        case 'budget':
          aValue = a.budget || 0;
          bValue = b.budget || 0;
          break;
        case 'boxOffice':
          aValue = a.boxOffice || 0;
          bValue = b.boxOffice || 0;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (aValue < bValue) return -1 * order;
      if (aValue > bValue) return 1 * order;
      return 0;
    });
  }

  private paginateResults(
    results: SearchItemDto[],
    page: number,
    limit: number,
  ): SearchItemDto[] {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return results.slice(startIndex, endIndex);
  }
}
