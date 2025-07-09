/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma.service';

describe('TransactionService', () => {
  let service: TransactionService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    movie: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    actor: {
      delete: jest.fn(),
    },
    movieActor: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    movieRating: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeTransaction', () => {
    it('should execute transaction successfully', async () => {
      const mockResult = { id: 1, title: 'Test Movie' };
      const mockOperation = jest.fn().mockResolvedValue(mockResult);

      mockPrismaService.$transaction.mockImplementation((operation) =>
        operation(mockPrismaService),
      );

      const result = await service.executeTransaction(mockOperation);

      expect(mockPrismaService.$transaction).toHaveBeenCalledWith(
        mockOperation,
        {
          maxWait: 5000,
          timeout: 10000,
          isolationLevel: undefined,
        },
      );
      expect(mockOperation).toHaveBeenCalledWith(mockPrismaService);
      expect(result).toEqual(mockResult);
    });

    it('should execute transaction with custom options', async () => {
      const mockResult = 'success';
      const mockOperation = jest.fn().mockResolvedValue(mockResult);
      const options = {
        maxWait: 3000,
        timeout: 8000,
        isolationLevel: 'ReadCommitted' as any,
      };

      mockPrismaService.$transaction.mockImplementation((operation) =>
        operation(mockPrismaService),
      );

      const result = await service.executeTransaction(mockOperation, options);

      expect(mockPrismaService.$transaction).toHaveBeenCalledWith(
        mockOperation,
        options,
      );
      expect(result).toEqual(mockResult);
    });

    it('should throw error when transaction fails', async () => {
      const error = new Error('Transaction failed');
      const mockOperation = jest.fn().mockRejectedValue(error);

      mockPrismaService.$transaction.mockRejectedValue(error);

      await expect(service.executeTransaction(mockOperation)).rejects.toThrow(
        'Transaction failed',
      );
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('executeMultipleOperations', () => {
    it('should execute multiple operations in transaction', async () => {
      const operations = {
        operation1: jest.fn().mockResolvedValue('result1'),
        operation2: jest.fn().mockResolvedValue('result2'),
      };

      mockPrismaService.$transaction.mockImplementation((operation) =>
        operation(mockPrismaService),
      );

      const result = await service.executeMultipleOperations(operations);

      expect(result).toEqual({
        operation1: 'result1',
        operation2: 'result2',
      });
      expect(operations.operation1).toHaveBeenCalledWith(mockPrismaService);
      expect(operations.operation2).toHaveBeenCalledWith(mockPrismaService);
    });
  });

  describe('deleteMovieWithRelations', () => {
    it('should delete movie with all relations and return the deleted movie', async () => {
      const movieId = 1;
      const mockDeletedMovie = {
        id: movieId,
        title: 'Test Movie',
        releaseYear: 2023,
        genre: 'Action',
        duration: 120,
        description: 'Test description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.$transaction.mockImplementation((operation) =>
        operation(mockPrismaService),
      );
      mockPrismaService.movie.delete.mockResolvedValue(mockDeletedMovie);

      const result = await service.deleteMovieWithRelations(movieId);

      expect(result).toEqual(mockDeletedMovie);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();

      // Get the transaction operation that was passed
      const transactionOperation =
        mockPrismaService.$transaction.mock.calls[0][0];

      // Execute the operation with our mock to verify the calls
      await transactionOperation(mockPrismaService);

      expect(mockPrismaService.movieRating.deleteMany).toHaveBeenCalledWith({
        where: { movieId },
      });
      expect(mockPrismaService.movieActor.deleteMany).toHaveBeenCalledWith({
        where: { movieId },
      });
      expect(mockPrismaService.movie.delete).toHaveBeenCalledWith({
        where: { id: movieId },
      });
    });
  });

  describe('deleteActorWithRelations', () => {
    it('should delete actor with all relations', async () => {
      const actorId = 1;

      mockPrismaService.$transaction.mockImplementation((operation) =>
        operation(mockPrismaService),
      );

      await service.deleteActorWithRelations(actorId);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();

      // Get the transaction operation that was passed
      const transactionOperation =
        mockPrismaService.$transaction.mock.calls[0][0];

      // Execute the operation with our mock to verify the calls
      await transactionOperation(mockPrismaService);

      expect(mockPrismaService.movieActor.deleteMany).toHaveBeenCalledWith({
        where: { actorId },
      });
      expect(mockPrismaService.actor.delete).toHaveBeenCalledWith({
        where: { id: actorId },
      });
    });
  });

  describe('createMovieWithActors', () => {
    it('should create movie with actors in transaction', async () => {
      const movieData = {
        title: 'Test Movie',
        description: 'Test Description',
        releaseYear: 2023,
        genre: 'Action',
        duration: 120,
      };
      const actorIds = [1, 2];
      const roles = ['Lead', 'Supporting'];

      const mockMovie = { id: 1, ...movieData };
      const mockMovieWithActors = {
        ...mockMovie,
        actors: [
          {
            id: 1,
            movieId: 1,
            actorId: 1,
            role: 'Lead',
            actor: { id: 1, name: 'Actor 1' },
          },
          {
            id: 2,
            movieId: 1,
            actorId: 2,
            role: 'Supporting',
            actor: { id: 2, name: 'Actor 2' },
          },
        ],
      };

      mockPrismaService.movie.create.mockResolvedValue(mockMovie);
      mockPrismaService.movieActor.createMany.mockResolvedValue({ count: 2 });
      mockPrismaService.movie.findUnique.mockResolvedValue(mockMovieWithActors);

      mockPrismaService.$transaction.mockImplementation((operation) =>
        operation(mockPrismaService),
      );

      const result = await service.createMovieWithActors(
        movieData as any,
        actorIds,
        roles,
      );

      expect(mockPrismaService.$transaction).toHaveBeenCalled();

      // Get the transaction operation and execute it
      const transactionOperation =
        mockPrismaService.$transaction.mock.calls[0][0];
      await transactionOperation(mockPrismaService);

      expect(mockPrismaService.movie.create).toHaveBeenCalledWith({
        data: movieData,
      });
      expect(mockPrismaService.movieActor.createMany).toHaveBeenCalledWith({
        data: [
          { movieId: 1, actorId: 1, role: 'Lead' },
          { movieId: 1, actorId: 2, role: 'Supporting' },
        ],
      });
      expect(mockPrismaService.movie.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          actors: {
            include: {
              actor: true,
            },
          },
        },
      });

      expect(result).toEqual(mockMovieWithActors);
    });

    it('should use default role when not provided', async () => {
      const movieData = { title: 'Test Movie' } as any;
      const actorIds = [1];
      const roles = [];

      const mockMovie = { id: 1, ...movieData };

      mockPrismaService.movie.create.mockResolvedValue(mockMovie);
      mockPrismaService.movieActor.createMany.mockResolvedValue({ count: 1 });
      mockPrismaService.movie.findUnique.mockResolvedValue(mockMovie);

      mockPrismaService.$transaction.mockImplementation((operation) =>
        operation(mockPrismaService),
      );

      await service.createMovieWithActors(movieData, actorIds, roles);

      // Get the transaction operation and execute it
      const transactionOperation =
        mockPrismaService.$transaction.mock.calls[0][0];
      await transactionOperation(mockPrismaService);

      expect(mockPrismaService.movieActor.createMany).toHaveBeenCalledWith({
        data: [{ movieId: 1, actorId: 1, role: 'Actor' }],
      });
    });
  });

  describe('updateMovieWithRelations', () => {
    it('should update movie and handle actor relationships', async () => {
      const movieId = 1;
      const movieData = { title: 'Updated Movie' };
      const actorUpdates = {
        add: [{ actorId: 3, role: 'New Actor' }],
        remove: [1],
        update: [{ id: 2, role: 'Updated Role' }],
      };

      const mockUpdatedMovie = { id: movieId, ...movieData };
      const mockMovieWithRelations = {
        ...mockUpdatedMovie,
        actors: [],
        ratings: [],
      };

      mockPrismaService.movie.update.mockResolvedValue(mockUpdatedMovie);
      mockPrismaService.movieActor.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.movieActor.createMany.mockResolvedValue({ count: 1 });
      mockPrismaService.movieActor.update.mockResolvedValue({});
      mockPrismaService.movie.findUnique.mockResolvedValue(
        mockMovieWithRelations,
      );

      mockPrismaService.$transaction.mockImplementation((operation) =>
        operation(mockPrismaService),
      );

      const result = await service.updateMovieWithRelations(
        movieId,
        movieData as any,
        actorUpdates,
      );

      expect(mockPrismaService.$transaction).toHaveBeenCalled();

      // Get the transaction operation and execute it
      const transactionOperation =
        mockPrismaService.$transaction.mock.calls[0][0];
      await transactionOperation(mockPrismaService);

      expect(mockPrismaService.movie.update).toHaveBeenCalledWith({
        where: { id: movieId },
        data: movieData,
      });
      expect(mockPrismaService.movieActor.deleteMany).toHaveBeenCalledWith({
        where: { movieId, actorId: { in: [1] } },
      });
      expect(mockPrismaService.movieActor.createMany).toHaveBeenCalledWith({
        data: [{ movieId, actorId: 3, role: 'New Actor' }],
      });
      expect(mockPrismaService.movieActor.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { role: 'Updated Role' },
      });

      expect(result).toEqual(mockMovieWithRelations);
    });

    it('should update movie without actor updates', async () => {
      const movieId = 1;
      const movieData = { title: 'Updated Movie' };

      const mockUpdatedMovie = { id: movieId, ...movieData };
      const mockMovieWithRelations = {
        ...mockUpdatedMovie,
        actors: [],
        ratings: [],
      };

      mockPrismaService.movie.update.mockResolvedValue(mockUpdatedMovie);
      mockPrismaService.movie.findUnique.mockResolvedValue(
        mockMovieWithRelations,
      );

      mockPrismaService.$transaction.mockImplementation((operation) =>
        operation(mockPrismaService),
      );

      const result = await service.updateMovieWithRelations(
        movieId,
        movieData as any,
      );

      expect(mockPrismaService.$transaction).toHaveBeenCalled();

      // Verify that actor update methods are not called
      expect(mockPrismaService.movieActor.deleteMany).not.toHaveBeenCalled();
      expect(mockPrismaService.movieActor.createMany).not.toHaveBeenCalled();
      expect(mockPrismaService.movieActor.update).not.toHaveBeenCalled();

      expect(result).toEqual(mockMovieWithRelations);
    });
  });

  describe('batchCreateRatings', () => {
    it('should create multiple ratings in transaction', async () => {
      const ratings = [
        { movieId: 1, rating: 8.5, comment: 'Great movie', reviewer: 'User1' },
        { movieId: 1, rating: 9.0, comment: 'Excellent', reviewer: 'User2' },
      ];

      const mockMovie = { id: 1, title: 'Test Movie' };
      const mockRatings = [
        {
          id: 1,
          ...ratings[0],
          createdAt: new Date(),
          movie: { id: 1, title: 'Test Movie' },
        },
        {
          id: 2,
          ...ratings[1],
          createdAt: new Date(),
          movie: { id: 1, title: 'Test Movie' },
        },
      ];

      mockPrismaService.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrismaService.movieRating.create
        .mockResolvedValueOnce(mockRatings[0])
        .mockResolvedValueOnce(mockRatings[1]);

      mockPrismaService.$transaction.mockImplementation((operation) =>
        operation(mockPrismaService),
      );

      const result = await service.batchCreateRatings(ratings);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.movie.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.movieRating.create).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockRatings);
    });

    it('should throw error when movie not found', async () => {
      const ratings = [
        {
          movieId: 999,
          rating: 8.5,
          comment: 'Great movie',
          reviewer: 'User1',
        },
      ];

      mockPrismaService.movie.findUnique.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation((operation) =>
        operation(mockPrismaService),
      );

      await expect(service.batchCreateRatings(ratings)).rejects.toThrow(
        'Movie with ID 999 not found',
      );
    });
  });
});
