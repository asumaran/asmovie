import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import { QueryBuilderService } from '../common/services/query-builder.service';
import { TransactionService } from '../common/services/transaction.service';
import {
  ResourceNotFoundException,
  DuplicateResourceException,
} from '../common/exceptions/business.exception';
import {
  PaginatedResponse,
  PaginationHelper,
} from '../common/interfaces/paginated-response.interface';
import {
  CreateMovieDto,
  UpdateMovieDto,
  AddActorToMovieDto,
  MovieFilterDto,
} from './dto/movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
    private readonly transactionService: TransactionService,
    private readonly configService: ConfigService,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const { actors, ...movieData } = createMovieDto;
    
    // First, create the movie
    const movie = await this.prisma.movie.create({
      data: movieData,
      include: {
        actors: {
          include: {
            actor: true,
          },
        },
        ratings: true,
      },
    });

    // If actors are provided, add them to the movie
    if (actors && actors.length > 0) {
      // Validate that all actors exist
      const actorIds = actors.map(a => a.actorId);
      const existingActors = await this.prisma.actor.findMany({
        where: { id: { in: actorIds } },
        select: { id: true },
      });
      
      const existingActorIds = existingActors.map(a => a.id);
      const missingActorIds = actorIds.filter(id => !existingActorIds.includes(id));
      
      if (missingActorIds.length > 0) {
        throw new ResourceNotFoundException('Actor(s)', missingActorIds.join(', '));
      }

      // Create movie-actor relationships
      await this.prisma.movieActor.createMany({
        data: actors.map(actor => ({
          movieId: movie.id,
          actorId: actor.actorId,
          role: actor.role,
        })),
      });

      // Return the movie with actors
      return this.prisma.movie.findUnique({
        where: { id: movie.id },
        include: {
          actors: {
            include: {
              actor: true,
            },
          },
          ratings: true,
        },
      });
    }

    return movie;
  }

  async findAll(
    filters: MovieFilterDto,
    page: number = 1,
    limit?: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<PaginatedResponse<any>> {
    const defaultLimit = this.configService.get<number>(
      'pagination.defaultLimit',
      10,
    );
    const effectiveLimit = limit ?? defaultLimit;
    const where = this.queryBuilder.buildMovieWhere({
      search: filters.search,
      genre: filters.genre,
      releaseYear: filters.releaseYear,
      minRating: filters.minRating,
      maxRating: filters.maxRating,
    });

    const include = this.queryBuilder.buildMovieInclude({
      includeActors: true,
      includeRatings: true,
    });

    const orderBy = this.queryBuilder.buildOrderBy(
      filters.sortBy,
      filters.sortOrder,
      {
        createdAt: 'desc' as const,
      },
    );

    const queryOptions = this.queryBuilder.buildPaginatedQuery({
      page,
      limit: effectiveLimit,
      include,
      where,
      orderBy,
    });

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany(queryOptions),
      this.prisma.movie.count({ where }),
    ]);

    const meta = PaginationHelper.createMeta(page, effectiveLimit, total);
    return PaginationHelper.createResponse(movies, meta);
  }

  async findOne(id: number) {
    const include = this.queryBuilder.buildMovieInclude({
      includeActors: true,
      includeRatings: true,
    });

    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include,
    });

    if (!movie) {
      throw new ResourceNotFoundException('Movie', id);
    }

    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    await this.findOne(id); // Check if exists

    const { actors, ...movieData } = updateMovieDto;
    
    const include = this.queryBuilder.buildMovieInclude({
      includeActors: true,
      includeRatings: true,
    });

    // Update the movie basic data
    const movie = await this.prisma.movie.update({
      where: { id },
      data: movieData,
      include,
    });

    // If actors are provided, update the movie-actor relationships
    if (actors !== undefined) {
      // Remove existing relationships
      await this.prisma.movieActor.deleteMany({
        where: { movieId: id },
      });

      // If actors array is not empty, add new relationships
      if (actors.length > 0) {
        // Validate that all actors exist
        const actorIds = actors.map(a => a.actorId);
        const existingActors = await this.prisma.actor.findMany({
          where: { id: { in: actorIds } },
          select: { id: true },
        });
        
        const existingActorIds = existingActors.map(a => a.id);
        const missingActorIds = actorIds.filter(id => !existingActorIds.includes(id));
        
        if (missingActorIds.length > 0) {
          throw new ResourceNotFoundException('Actor(s)', missingActorIds.join(', '));
        }

        // Create new movie-actor relationships
        await this.prisma.movieActor.createMany({
          data: actors.map(actor => ({
            movieId: id,
            actorId: actor.actorId,
            role: actor.role,
          })),
        });
      }

      // Return the movie with updated actors
      return this.prisma.movie.findUnique({
        where: { id },
        include,
      });
    }

    return movie;
  }

  async remove(id: number) {
    await this.findOne(id); // Check if exists

    return this.transactionService.deleteMovieWithRelations(id);
  }

  async addActor(movieId: number, addActorDto: AddActorToMovieDto) {
    const movie = await this.findOne(movieId);

    // Check if actor exists
    const actor = await this.prisma.actor.findUnique({
      where: { id: addActorDto.actorId },
    });

    if (!actor) {
      throw new ResourceNotFoundException('Actor', addActorDto.actorId);
    }

    // Check if relationship already exists
    const existingRelation = await this.prisma.movieActor.findUnique({
      where: {
        movieId_actorId: {
          movieId,
          actorId: addActorDto.actorId,
        },
      },
      include: {
        actor: true,
        movie: true,
      },
    });

    if (existingRelation) {
      throw new DuplicateResourceException(
        'Movie-Actor relationship',
        'actor',
        `${actor.name} in ${movie.title}`,
      );
    }

    await this.prisma.movieActor.create({
      data: {
        movieId,
        actorId: addActorDto.actorId,
        role: addActorDto.role,
      },
    });

    // Return the movie with updated actors
    return this.prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        actors: {
          include: {
            actor: true,
          },
        },
      },
    });
  }

  async removeActor(movieId: number, actorId: number) {
    await this.findOne(movieId); // Check if movie exists

    const relation = await this.prisma.movieActor.findUnique({
      where: {
        movieId_actorId: {
          movieId,
          actorId,
        },
      },
    });

    if (!relation) {
      throw new ResourceNotFoundException(
        'Movie-Actor relationship',
        `movieId:${movieId}, actorId:${actorId}`,
      );
    }

    return this.prisma.movieActor.delete({
      where: {
        movieId_actorId: {
          movieId,
          actorId,
        },
      },
    });
  }

  async getActors(movieId: number) {
    await this.findOne(movieId); // Check if movie exists

    return this.prisma.movieActor.findMany({
      where: { movieId },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            biography: true,
            birthDate: true,
          },
        },
      },
      orderBy: {
        role: 'asc',
      },
    });
  }
}
