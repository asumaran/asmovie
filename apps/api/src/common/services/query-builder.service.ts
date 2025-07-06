import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class QueryBuilderService {
  /**
   * Build optimized include options for Movie queries
   */
  buildMovieInclude(
    options: {
      includeActors?: boolean;
      includeRatings?: boolean;
      includeActorDetails?: boolean;
      includeRatingDetails?: boolean;
    } = {},
  ): Prisma.MovieInclude {
    const {
      includeActors = false,
      includeRatings = false,
      includeActorDetails = true,
      includeRatingDetails = true,
    } = options;

    return {
      ...(includeActors && {
        actors: {
          include: {
            actor: includeActorDetails
              ? {
                  select: {
                    id: true,
                    name: true,
                    biography: true,
                    birthDate: true,
                  },
                }
              : true,
          },
        },
      }),
      ...(includeRatings && {
        ratings: includeRatingDetails
          ? {
              select: {
                id: true,
                rating: true,
                comment: true,
                reviewer: true,
                createdAt: true,
              },
            }
          : true,
      }),
    };
  }

  /**
   * Build optimized include options for Actor queries
   */
  buildActorInclude(
    options: {
      includeMovies?: boolean;
      includeMovieDetails?: boolean;
    } = {},
  ): Prisma.ActorInclude {
    const { includeMovies = false, includeMovieDetails = true } = options;

    return {
      ...(includeMovies && {
        movies: {
          include: {
            movie: includeMovieDetails
              ? {
                  select: {
                    id: true,
                    title: true,
                    releaseYear: true,
                    genre: true,
                    duration: true,
                  },
                }
              : true,
          },
        },
      }),
    };
  }

  /**
   * Build where clause for Movie search and filtering
   */
  buildMovieWhere(filters: {
    search?: string;
    genre?: string;
    releaseYear?: number;
    minRating?: number;
    maxRating?: number;
  }): Prisma.MovieWhereInput {
    const { search, genre, releaseYear, minRating, maxRating } = filters;

    return {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(genre && { genre: { equals: genre, mode: 'insensitive' } }),
      ...(releaseYear && { releaseYear }),
      ...(minRating &&
        maxRating && {
          ratings: {
            some: {
              rating: {
                gte: minRating,
                lte: maxRating,
              },
            },
          },
        }),
    };
  }

  /**
   * Build where clause for Actor search and filtering
   */
  buildActorWhere(filters: {
    search?: string;
    birthYearFrom?: number;
    birthYearTo?: number;
  }): Prisma.ActorWhereInput {
    const { search, birthYearFrom, birthYearTo } = filters;

    return {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { biography: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(birthYearFrom &&
        birthYearTo && {
          birthDate: {
            gte: new Date(`${birthYearFrom}-01-01`),
            lte: new Date(`${birthYearTo}-12-31`),
          },
        }),
    };
  }

  /**
   * Build optimized order by clause
   */
  buildOrderBy<T extends Record<string, unknown>>(
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    defaultSort: T = {} as T,
  ): T {
    if (!sortBy) {
      return defaultSort;
    }

    const orderBy = {} as Record<string, 'asc' | 'desc'>;
    orderBy[sortBy] = sortOrder;
    return orderBy as T;
  }

  /**
   * Calculate pagination offset and limit
   */
  buildPagination(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    return {
      skip: offset,
      take: limit,
    };
  }

  /**
   * Build complete query options for paginated results
   */
  buildPaginatedQuery<TInclude, TOrderBy, TWhere>(options: {
    page?: number;
    limit?: number;
    include?: TInclude;
    where?: TWhere;
    orderBy?: TOrderBy;
  }) {
    const { page = 1, limit = 10, include, where, orderBy } = options;
    const pagination = this.buildPagination(page, limit);

    return {
      ...pagination,
      ...(include && { include }),
      ...(where && { where }),
      ...(orderBy && { orderBy }),
    };
  }
}
