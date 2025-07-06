import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateActorDto, UpdateActorDto } from './dto/actor.dto';

@Injectable()
export class ActorsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findAll(search?: string) {
    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    return this.prisma.actor.findMany({
      where,
      include: {
        movies: {
          include: {
            movie: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
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
