import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { PrismaService } from '../common/prisma.service';
import { QueryBuilderService } from '../common/services/query-builder.service';
import { TransactionService } from '../common/services/transaction.service';
import { ConfigService } from '@nestjs/config';

describe('MoviesService', () => {
  let service: MoviesService;

  const mockPrismaService = {
    movie: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    actor: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    movieActor: {
      create: jest.fn(),
      createMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockQueryBuilderService = {
    buildMovieInclude: jest.fn().mockReturnValue({
      actors: { include: { actor: true } },
      ratings: true,
    }),
    buildMovieWhere: jest.fn().mockReturnValue({}),
    buildOrderBy: jest.fn().mockReturnValue({ createdAt: 'desc' }),
    buildPaginatedQuery: jest.fn().mockReturnValue({
      skip: 0,
      take: 10,
      include: { actors: { include: { actor: true } }, ratings: true },
      where: {},
      orderBy: { createdAt: 'desc' },
    }),
  };

  const mockTransactionService = {
    deleteMovieWithRelations: jest.fn(),
    executeTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: QueryBuilderService,
          useValue: mockQueryBuilderService,
        },
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key, def) => def ?? 10),
          },
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a movie without actors', async () => {
      const createMovieDto = {
        title: 'Test Movie',
        description: 'Test Description',
        releaseYear: 2023,
        genre: 'Action',
        duration: 120,
      };

      const expectedMovie = {
        id: 1,
        ...createMovieDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        actors: [],
        ratings: [],
      };

      mockPrismaService.movie.create.mockResolvedValue(expectedMovie);

      const result = await service.create(createMovieDto);

      expect(mockPrismaService.movie.create).toHaveBeenCalledWith({
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
      expect(result).toEqual(expectedMovie);
    });

    it('should create a movie with actors', async () => {
      const createMovieDto = {
        title: 'Test Movie with Actors',
        description: 'Test Description',
        releaseYear: 2023,
        genre: 'Action',
        duration: 120,
        actors: [
          { actorId: 1, role: 'Lead Actor' },
          { actorId: 2, role: 'Supporting Actor' },
        ],
      };

      const { actors, ...movieData } = createMovieDto;

      const createdMovie = {
        id: 1,
        ...movieData,
        createdAt: new Date(),
        updatedAt: new Date(),
        actors: [],
        ratings: [],
      };

      const expectedMovieWithActors = {
        ...createdMovie,
        actors: [
          {
            id: 1,
            movieId: 1,
            actorId: 1,
            role: 'Lead Actor',
            actor: {
              id: 1,
              name: 'Actor 1',
              biography: 'Bio 1',
              birthDate: new Date(),
            },
          },
          {
            id: 2,
            movieId: 1,
            actorId: 2,
            role: 'Supporting Actor',
            actor: {
              id: 2,
              name: 'Actor 2',
              biography: 'Bio 2',
              birthDate: new Date(),
            },
          },
        ],
      };

      const existingActors = [{ id: 1 }, { id: 2 }];

      mockPrismaService.movie.create.mockResolvedValue(createdMovie);
      mockPrismaService.actor.findMany.mockResolvedValue(existingActors);
      mockPrismaService.movieActor.createMany.mockResolvedValue({ count: 2 });
      mockPrismaService.movie.findUnique.mockResolvedValue(
        expectedMovieWithActors,
      );

      const result = await service.create(createMovieDto);

      expect(mockPrismaService.movie.create).toHaveBeenCalledWith({
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

      expect(mockPrismaService.actor.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
        select: { id: true },
      });

      expect(mockPrismaService.movieActor.createMany).toHaveBeenCalledWith({
        data: [
          { movieId: 1, actorId: 1, role: 'Lead Actor' },
          { movieId: 1, actorId: 2, role: 'Supporting Actor' },
        ],
      });

      expect(result).toEqual(expectedMovieWithActors);
    });

    it('should throw error if actor not found when creating movie with actors', async () => {
      const createMovieDto = {
        title: 'Test Movie',
        description: 'Test Description',
        releaseYear: 2023,
        genre: 'Action',
        duration: 120,
        actors: [{ actorId: 999, role: 'Lead Actor' }],
      };

      const { actors, ...movieData } = createMovieDto;

      const createdMovie = {
        id: 1,
        ...movieData,
        createdAt: new Date(),
        updatedAt: new Date(),
        actors: [],
        ratings: [],
      };

      mockPrismaService.movie.create.mockResolvedValue(createdMovie);
      mockPrismaService.actor.findMany.mockResolvedValue([]); // No actors found

      await expect(service.create(createMovieDto)).rejects.toThrow(
        "Actor(s) with identifier '999' not found",
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated movies', async () => {
      const expectedMovies = [
        {
          id: 1,
          title: 'Movie 1',
          actors: [],
          ratings: [],
        },
      ];

      mockPrismaService.movie.findMany.mockResolvedValue(expectedMovies);
      mockPrismaService.movie.count.mockResolvedValue(expectedMovies.length);

      const result = await service.findAll({}, 1, 10);

      expect(result).toEqual({
        data: expectedMovies,
        meta: {
          page: 1,
          limit: 10,
          total: expectedMovies.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    });

    it('should return movies filtered by search term', async () => {
      const searchTerm = 'inception';
      const expectedMovies = [
        {
          id: 1,
          title: 'Inception',
          actors: [],
          ratings: [],
        },
      ];

      mockPrismaService.movie.findMany.mockResolvedValue(expectedMovies);
      mockPrismaService.movie.count.mockResolvedValue(expectedMovies.length);

      const result = await service.findAll({ search: searchTerm }, 1, 10);

      expect(result).toEqual({
        data: expectedMovies,
        meta: {
          page: 1,
          limit: 10,
          total: expectedMovies.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    });

    it('should use default values when called without parameters', async () => {
      const expectedMovies = [
        {
          id: 1,
          title: 'Movie 1',
          actors: [],
          ratings: [],
        },
      ];

      mockPrismaService.movie.findMany.mockResolvedValue(expectedMovies);
      mockPrismaService.movie.count.mockResolvedValue(expectedMovies.length);

      // Call with empty filters object to verify that it uses default values
      const result = await service.findAll({});

      expect(mockQueryBuilderService.buildMovieWhere).toHaveBeenCalledWith({
        search: undefined,
        genre: undefined,
        releaseYear: undefined,
        minRating: undefined,
        maxRating: undefined,
      });
      expect(mockQueryBuilderService.buildOrderBy).toHaveBeenCalledWith(
        undefined,
        undefined,
        {
          createdAt: 'desc',
        },
      );
      expect(mockQueryBuilderService.buildPaginatedQuery).toHaveBeenCalledWith({
        page: 1,
        limit: 10, // Should use the default value from ConfigService
        include: { actors: { include: { actor: true } }, ratings: true },
        where: {},
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        data: expectedMovies,
        meta: {
          page: 1,
          limit: 10,
          total: expectedMovies.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a movie by id', async () => {
      const movieId = 1;
      const expectedMovie = {
        id: movieId,
        title: 'Test Movie',
        actors: [],
        ratings: [],
      };

      mockPrismaService.movie.findUnique.mockResolvedValue(expectedMovie);

      const result = await service.findOne(movieId);

      expect(mockPrismaService.movie.findUnique).toHaveBeenCalledWith({
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
      expect(result).toEqual(expectedMovie);
    });

    it('should throw NotFoundException if movie not found', async () => {
      const movieId = 999;

      mockPrismaService.movie.findUnique.mockResolvedValue(null);

      await expect(service.findOne(movieId)).rejects.toThrow(
        `Movie with identifier '${movieId}' not found`,
      );
    });
  });

  describe('addActor', () => {
    it('should add an actor to a movie', async () => {
      const movieId = 1;
      const addActorDto = {
        actorId: 1,
        role: 'Lead Actor',
      };

      const mockMovie = { id: movieId, title: 'Test Movie' };
      const mockActor = { id: 1, name: 'Test Actor' };
      const mockMovieWithActors = {
        id: movieId,
        title: 'Test Movie',
        actors: [
          {
            id: 1,
            movieId,
            actorId: 1,
            role: 'Lead Actor',
            actor: mockActor,
          },
        ],
      };

      mockPrismaService.movie.findUnique
        .mockResolvedValueOnce(mockMovie) // First call in findOne
        .mockResolvedValueOnce(mockMovieWithActors); // Second call after creating relation
      mockPrismaService.actor.findUnique.mockResolvedValue(mockActor);
      mockPrismaService.movieActor.findUnique.mockResolvedValue(null);
      mockPrismaService.movieActor.create.mockResolvedValue({});

      const result = await service.addActor(movieId, addActorDto);

      expect(mockPrismaService.movieActor.create).toHaveBeenCalledWith({
        data: {
          movieId,
          actorId: addActorDto.actorId,
          role: addActorDto.role,
        },
      });

      expect(mockPrismaService.movie.findUnique).toHaveBeenCalledWith({
        where: { id: movieId },
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

    it('should throw NotFoundException if actor not found', async () => {
      const movieId = 1;
      const addActorDto = {
        actorId: 999,
        role: 'Lead Actor',
      };

      const mockMovie = { id: movieId, title: 'Test Movie' };

      mockPrismaService.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrismaService.actor.findUnique.mockResolvedValue(null);

      await expect(service.addActor(movieId, addActorDto)).rejects.toThrow(
        `Actor with identifier '${addActorDto.actorId}' not found`,
      );
    });
  });

  describe('update', () => {
    it('should update a movie without touching actors', async () => {
      const movieId = 1;
      const updateMovieDto = {
        title: 'Updated Movie',
        description: 'Updated Description',
      };

      const existingMovie = {
        id: movieId,
        title: 'Original Movie',
        description: 'Original Description',
        releaseYear: 2023,
        genre: 'Action',
        duration: 120,
        actors: [],
        ratings: [],
      };

      const updatedMovie = {
        ...existingMovie,
        ...updateMovieDto,
      };

      mockPrismaService.movie.findUnique.mockResolvedValue(existingMovie);
      mockPrismaService.movie.update.mockResolvedValue(updatedMovie);

      const result = await service.update(movieId, updateMovieDto);

      expect(mockPrismaService.movie.update).toHaveBeenCalledWith({
        where: { id: movieId },
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
      expect(result).toEqual(updatedMovie);
    });

    it('should update a movie with new actors', async () => {
      const movieId = 1;
      const updateMovieDto = {
        title: 'Updated Movie',
        actors: [
          { actorId: 1, role: 'New Lead Actor' },
          { actorId: 2, role: 'New Supporting Actor' },
        ],
      };

      const { actors, ...movieData } = updateMovieDto;

      const existingMovie = {
        id: movieId,
        title: 'Original Movie',
        description: 'Original Description',
        releaseYear: 2023,
        genre: 'Action',
        duration: 120,
        actors: [],
        ratings: [],
      };

      const updatedMovie = {
        ...existingMovie,
        ...movieData,
        actors: [
          {
            id: 1,
            movieId: 1,
            actorId: 1,
            role: 'New Lead Actor',
            actor: {
              id: 1,
              name: 'Actor 1',
              biography: 'Bio 1',
              birthDate: new Date(),
            },
          },
          {
            id: 2,
            movieId: 1,
            actorId: 2,
            role: 'New Supporting Actor',
            actor: {
              id: 2,
              name: 'Actor 2',
              biography: 'Bio 2',
              birthDate: new Date(),
            },
          },
        ],
      };

      const existingActors = [{ id: 1 }, { id: 2 }];

      mockPrismaService.movie.findUnique
        .mockResolvedValueOnce(existingMovie) // First call in update method
        .mockResolvedValueOnce(updatedMovie); // Second call to return updated movie
      mockPrismaService.movie.update.mockResolvedValue(updatedMovie);
      mockPrismaService.movieActor.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.actor.findMany.mockResolvedValue(existingActors);
      mockPrismaService.movieActor.createMany.mockResolvedValue({ count: 2 });

      const result = await service.update(movieId, updateMovieDto);

      expect(mockPrismaService.movie.update).toHaveBeenCalledWith({
        where: { id: movieId },
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

      expect(mockPrismaService.movieActor.deleteMany).toHaveBeenCalledWith({
        where: { movieId },
      });

      expect(mockPrismaService.actor.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
        select: { id: true },
      });

      expect(mockPrismaService.movieActor.createMany).toHaveBeenCalledWith({
        data: [
          { movieId: 1, actorId: 1, role: 'New Lead Actor' },
          { movieId: 1, actorId: 2, role: 'New Supporting Actor' },
        ],
      });

      expect(result).toEqual(updatedMovie);
    });

    it('should update a movie and remove all actors', async () => {
      const movieId = 1;
      const updateMovieDto = {
        title: 'Updated Movie',
        actors: [],
      };

      const { actors, ...movieData } = updateMovieDto;

      const existingMovie = {
        id: movieId,
        title: 'Original Movie',
        description: 'Original Description',
        releaseYear: 2023,
        genre: 'Action',
        duration: 120,
        actors: [{ id: 1, actorId: 1, role: 'Old Actor' }],
        ratings: [],
      };

      const updatedMovie = {
        ...existingMovie,
        ...movieData,
        actors: [],
      };

      mockPrismaService.movie.findUnique
        .mockResolvedValueOnce(existingMovie) // First call in update method
        .mockResolvedValueOnce(updatedMovie); // Second call to return updated movie
      mockPrismaService.movie.update.mockResolvedValue(updatedMovie);
      mockPrismaService.movieActor.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.update(movieId, updateMovieDto);

      expect(mockPrismaService.movieActor.deleteMany).toHaveBeenCalledWith({
        where: { movieId },
      });

      expect(mockPrismaService.movieActor.createMany).not.toHaveBeenCalled();

      expect(result).toEqual(updatedMovie);
    });

    it('should throw error if actor not found when updating movie with actors', async () => {
      const movieId = 1;
      const updateMovieDto = {
        title: 'Updated Movie',
        actors: [{ actorId: 999, role: 'Non-existent Actor' }],
      };

      const existingMovie = {
        id: movieId,
        title: 'Original Movie',
        actors: [],
        ratings: [],
      };

      const updatedMovie = {
        ...existingMovie,
        title: 'Updated Movie',
      };

      mockPrismaService.movie.findUnique.mockResolvedValue(existingMovie);
      mockPrismaService.movie.update.mockResolvedValue(updatedMovie);
      mockPrismaService.movieActor.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.actor.findMany.mockResolvedValue([]); // No actors found

      await expect(service.update(movieId, updateMovieDto)).rejects.toThrow(
        "Actor(s) with identifier '999' not found",
      );
    });

    it('should throw NotFoundException if movie not found', async () => {
      const movieId = 999;
      const updateMovieDto = { title: 'Updated Movie' };

      mockPrismaService.movie.findUnique.mockResolvedValue(null);

      await expect(service.update(movieId, updateMovieDto)).rejects.toThrow(
        `Movie with identifier '${movieId}' not found`,
      );
    });
  });

  describe('remove', () => {
    it('should remove a movie', async () => {
      const movieId = 1;
      const mockMovie = {
        id: movieId,
        title: 'Test Movie',
        releaseYear: 2023,
        genre: 'Action',
        duration: 120,
        description: 'Test description',
        createdAt: new Date(),
        updatedAt: new Date(),
        actors: [],
        ratings: [],
      };

      mockPrismaService.movie.findUnique.mockResolvedValue(mockMovie);
      mockTransactionService.deleteMovieWithRelations.mockResolvedValue(
        mockMovie,
      );

      const result = await service.remove(movieId);

      expect(
        mockTransactionService.deleteMovieWithRelations,
      ).toHaveBeenCalledWith(movieId);
      expect(result).toEqual(mockMovie);
    });

    it('should throw NotFoundException if movie not found', async () => {
      const movieId = 999;

      mockPrismaService.movie.findUnique.mockResolvedValue(null);

      await expect(service.remove(movieId)).rejects.toThrow(
        `Movie with identifier '${movieId}' not found`,
      );
    });
  });

  describe('removeActor', () => {
    it('should remove an actor from a movie', async () => {
      const movieId = 1;
      const actorId = 1;

      const mockMovie = { id: movieId, title: 'Test Movie' };
      const mockRelation = {
        id: 1,
        movieId,
        actorId,
        role: 'Lead Actor',
      };

      mockPrismaService.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrismaService.movieActor.findUnique.mockResolvedValue(mockRelation);
      mockPrismaService.movieActor.delete.mockResolvedValue(mockRelation);

      const result = await service.removeActor(movieId, actorId);

      expect(mockPrismaService.movieActor.delete).toHaveBeenCalledWith({
        where: {
          movieId_actorId: {
            movieId,
            actorId,
          },
        },
      });
      expect(result).toEqual(mockRelation);
    });

    it('should throw NotFoundException if actor not found in movie', async () => {
      const movieId = 1;
      const actorId = 1;

      const mockMovie = { id: movieId, title: 'Test Movie' };

      mockPrismaService.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrismaService.movieActor.findUnique.mockResolvedValue(null);

      await expect(service.removeActor(movieId, actorId)).rejects.toThrow(
        `Movie-Actor relationship with identifier 'movieId:${movieId}, actorId:${actorId}' not found`,
      );
    });
  });

  describe('getActors', () => {
    it('should return actors for a movie', async () => {
      const movieId = 1;
      const mockMovie = { id: movieId, title: 'Test Movie' };
      const expectedActors = [
        {
          id: 1,
          movieId,
          actorId: 1,
          role: 'Lead Actor',
          actor: {
            id: 1,
            name: 'Test Actor',
            bio: 'Test Bio',
          },
        },
      ];

      mockPrismaService.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrismaService.movieActor.findMany.mockResolvedValue(expectedActors);

      const result = await service.getActors(movieId);

      expect(mockPrismaService.movieActor.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(expectedActors);
    });

    it('should throw NotFoundException if movie not found', async () => {
      const movieId = 999;

      mockPrismaService.movie.findUnique.mockResolvedValue(null);

      await expect(service.getActors(movieId)).rejects.toThrow(
        `Movie with identifier '${movieId}' not found`,
      );
    });
  });

  describe('addActor - additional cases', () => {
    it('should throw error if actor is already in the movie', async () => {
      const movieId = 1;
      const addActorDto = {
        actorId: 1,
        role: 'Lead Actor',
      };

      const mockMovie = { id: movieId, title: 'Test Movie' };
      const mockActor = { id: 1, name: 'Test Actor' };
      const existingRelation = {
        id: 1,
        movieId,
        actorId: 1,
        role: 'Supporting Actor',
      };

      mockPrismaService.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrismaService.actor.findUnique.mockResolvedValue(mockActor);
      mockPrismaService.movieActor.findUnique.mockResolvedValue(
        existingRelation,
      );

      await expect(service.addActor(movieId, addActorDto)).rejects.toThrow(
        'Movie-Actor relationship with actor',
      );
    });
  });
});
