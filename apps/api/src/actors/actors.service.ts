import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import { QueryBuilderService } from '../common/services/query-builder.service';
import {
  PaginatedResponse,
  PaginationHelper,
} from '../common/interfaces/paginated-response.interface';
import { CreateActorDto, UpdateActorDto } from './dto/actor.dto';

@Injectable()
export class ActorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
    private readonly configService: ConfigService,
  ) {}

  async create(createActorDto: CreateActorDto) {
    const data = {
      ...createActorDto,
      birthDate: createActorDto.birthDate
        ? new Date(createActorDto.birthDate)
        : undefined,
    };

    return this.prisma.actor.create({
      data,
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
    });
  }

  async findAll(
    search?: string,
    page: number = 1,
    limit?: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<PaginatedResponse<any>> {
    const defaultLimit = this.configService.get<number>(
      'pagination.defaultLimit',
      10,
    );
    const effectiveLimit = limit ?? defaultLimit;

    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const include = {
      movies: {
        include: {
          movie: true,
        },
      },
    };

    const orderBy = {
      createdAt: 'desc' as const,
    };

    const queryOptions = this.queryBuilder.buildPaginatedQuery({
      page,
      limit: effectiveLimit,
      include,
      where,
      orderBy,
    });

    const [actors, total] = await Promise.all([
      this.prisma.actor.findMany(queryOptions),
      this.prisma.actor.count({ where }),
    ]);

    const meta = PaginationHelper.createMeta(page, effectiveLimit, total);
    return PaginationHelper.createResponse(actors, meta);
  }

  async findOne(id: number) {
    const actor = await this.prisma.actor.findUnique({
      where: { id },
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
    });

    if (!actor) {
      throw new NotFoundException(`Actor with ID ${id} not found`);
    }

    return actor;
  }

  async update(id: number, updateActorDto: UpdateActorDto) {
    await this.findOne(id); // Validate actor exists

    const data = {
      ...updateActorDto,
      birthDate: updateActorDto.birthDate
        ? new Date(updateActorDto.birthDate)
        : undefined,
    };

    return this.prisma.actor.update({
      where: { id },
      data,
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Validate actor exists

    return this.prisma.actor.delete({
      where: { id },
    });
  }

  async getMovies(actorId: number) {
    await this.findOne(actorId); // Validate actor exists

    const movieActors = await this.prisma.movieActor.findMany({
      where: { actorId },
      include: {
        movie: {
          include: {
            ratings: true,
          },
        },
      },
    });

    return movieActors.map((ma) => ma.movie);
  }
}
