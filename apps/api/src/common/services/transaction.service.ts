import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Execute a transaction with automatic rollback on error
   */
  async executeTransaction<T>(
    operations: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): Promise<T> {
    const transactionId = this.generateTransactionId();

    this.logger.debug(`Starting transaction ${transactionId}`);

    try {
      const result = await this.prisma.$transaction(operations, {
        maxWait: options?.maxWait ?? 5000, // 5 seconds
        timeout: options?.timeout ?? 10000, // 10 seconds
        isolationLevel: options?.isolationLevel,
      });

      this.logger.debug(`Transaction ${transactionId} completed successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Transaction ${transactionId} failed:`, error);
      throw error;
    }
  }

  /**
   * Execute multiple operations in a single transaction
   */
  async executeMultipleOperations<T extends Record<string, unknown>>(
    operations: Record<
      keyof T,
      (tx: Prisma.TransactionClient) => Promise<T[keyof T]>
    >,
  ): Promise<T> {
    return this.executeTransaction(async (tx) => {
      const results = {} as T;

      for (const [key, operation] of Object.entries(operations)) {
        results[key as keyof T] = await operation(tx);
      }

      return results;
    });
  }

  /**
   * Delete movie with all related data in a transaction
   */
  async deleteMovieWithRelations(movieId: number): Promise<void> {
    await this.executeTransaction(async (tx) => {
      // Delete movie ratings first
      await tx.movieRating.deleteMany({
        where: { movieId },
      });

      // Delete movie-actor relationships
      await tx.movieActor.deleteMany({
        where: { movieId },
      });

      // Delete the movie
      await tx.movie.delete({
        where: { id: movieId },
      });
    });
  }

  /**
   * Delete actor with all related data in a transaction
   */
  async deleteActorWithRelations(actorId: number): Promise<void> {
    await this.executeTransaction(async (tx) => {
      // Delete movie-actor relationships
      await tx.movieActor.deleteMany({
        where: { actorId },
      });

      // Delete the actor
      await tx.actor.delete({
        where: { id: actorId },
      });
    });
  }

  /**
   * Create movie with actors in a transaction
   */
  async createMovieWithActors(
    movieData: Prisma.MovieCreateInput,
    actorIds: number[],
    roles: string[],
  ): Promise<Prisma.MovieGetPayload<{
    include: {
      actors: {
        include: {
          actor: true;
        };
      };
    };
  }> | null> {
    return this.executeTransaction(async (tx) => {
      // Create the movie
      const movie = await tx.movie.create({
        data: movieData,
      });

      // Create movie-actor relationships
      const movieActorData = actorIds.map((actorId, index) => ({
        movieId: movie.id,
        actorId,
        role: roles[index] || 'Actor',
      }));

      await tx.movieActor.createMany({
        data: movieActorData,
      });

      // Return movie with actors
      return tx.movie.findUnique({
        where: { id: movie.id },
        include: {
          actors: {
            include: {
              actor: true,
            },
          },
        },
      });
    });
  }

  /**
   * Update movie and its relationships in a transaction
   */
  async updateMovieWithRelations(
    movieId: number,
    movieData: Prisma.MovieUpdateInput,
    actorUpdates?: {
      add?: { actorId: number; role: string }[];
      remove?: number[];
      update?: { id: number; role: string }[];
    },
  ): Promise<Prisma.MovieGetPayload<{
    include: {
      actors: {
        include: {
          actor: true;
        };
      };
      ratings: true;
    };
  }> | null> {
    return this.executeTransaction(async (tx) => {
      // Update movie data
      await tx.movie.update({
        where: { id: movieId },
        data: movieData,
      });

      if (actorUpdates) {
        // Remove actors
        if (actorUpdates.remove?.length) {
          await tx.movieActor.deleteMany({
            where: {
              movieId,
              actorId: { in: actorUpdates.remove },
            },
          });
        }

        // Add new actors
        if (actorUpdates.add?.length) {
          const newActorData = actorUpdates.add.map((actor) => ({
            movieId,
            actorId: actor.actorId,
            role: actor.role,
          }));

          await tx.movieActor.createMany({
            data: newActorData,
          });
        }

        // Update existing actor roles
        if (actorUpdates.update?.length) {
          for (const update of actorUpdates.update) {
            await tx.movieActor.update({
              where: {
                id: update.id,
              },
              data: {
                role: update.role,
              },
            });
          }
        }
      }

      // Return updated movie with relations
      return tx.movie.findUnique({
        where: { id: movieId },
        include: {
          actors: {
            include: {
              actor: true,
            },
          },
          ratings: true,
        },
      });
    });
  }

  /**
   * Batch create ratings with validation in a transaction
   */
  async batchCreateRatings(
    ratings: Array<{
      movieId: number;
      rating: number;
      comment?: string;
      reviewer: string;
    }>,
  ): Promise<
    Prisma.MovieRatingGetPayload<{
      include: {
        movie: {
          select: {
            id: true;
            title: true;
          };
        };
      };
    }>[]
  > {
    return this.executeTransaction(async (tx) => {
      const createdRatings: Prisma.MovieRatingGetPayload<{
        include: {
          movie: {
            select: {
              id: true;
              title: true;
            };
          };
        };
      }>[] = [];

      for (const ratingData of ratings) {
        // Validate movie exists
        const movie = await tx.movie.findUnique({
          where: { id: ratingData.movieId },
        });

        if (!movie) {
          throw new Error(`Movie with ID ${ratingData.movieId} not found`);
        }

        // Create rating
        const rating = await tx.movieRating.create({
          data: ratingData,
          include: {
            movie: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        });

        createdRatings.push(rating);
      }

      return createdRatings;
    });
  }

  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
