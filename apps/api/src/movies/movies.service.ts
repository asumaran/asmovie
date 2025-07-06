import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  CreateMovieDto,
  UpdateMovieDto,
  AddActorToMovieDto,
} from './dto/movie.dto';

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) {}

  async create(createMovieDto: CreateMovieDto) {
    return this.prisma.movie.create({
      data: createMovieDto,
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

  async findAll(search?: string) {
    const where = search
      ? {
          title: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    return this.prisma.movie.findMany({
      where,
      include: {
        actors: {
          include: {
            actor: true,
          },
        },
        ratings: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        actors: {
          include: {
            actor: true,
          },
        },
        ratings: true,
      },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.findOne(id);

    return this.prisma.movie.update({
      where: { id },
      data: updateMovieDto,
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

  async remove(id: number) {
    const movie = await this.findOne(id);

    return this.prisma.movie.delete({
      where: { id },
    });
  }

  async addActor(movieId: number, addActorDto: AddActorToMovieDto) {
    const movie = await this.findOne(movieId);

    // Check if actor exists
    const actor = await this.prisma.actor.findUnique({
      where: { id: addActorDto.actorId },
    });

    if (!actor) {
      throw new NotFoundException(
        `Actor with ID ${addActorDto.actorId} not found`,
      );
    }

    // Check if relationship already exists
    const existingRelation = await this.prisma.movieActor.findUnique({
      where: {
        movieId_actorId: {
          movieId,
          actorId: addActorDto.actorId,
        },
      },
    });

    if (existingRelation) {
      throw new Error('Actor is already in this movie');
    }

    return this.prisma.movieActor.create({
      data: {
        movieId,
        actorId: addActorDto.actorId,
        role: addActorDto.role,
      },
      include: {
        actor: true,
        movie: true,
      },
    });
  }

  async removeActor(movieId: number, actorId: number) {
    const movie = await this.findOne(movieId);

    const relation = await this.prisma.movieActor.findUnique({
      where: {
        movieId_actorId: {
          movieId,
          actorId,
        },
      },
    });

    if (!relation) {
      throw new NotFoundException('Actor not found in this movie');
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
    const movie = await this.findOne(movieId);

    return this.prisma.movieActor.findMany({
      where: { movieId },
      include: {
        actor: true,
      },
    });
  }
}
