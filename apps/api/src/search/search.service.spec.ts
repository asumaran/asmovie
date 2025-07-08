import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../common/prisma.service';
import { QueryBuilderService } from '../common/services/query-builder.service';
import { ConfigService } from '@nestjs/config';

describe('SearchService', () => {
  let service: SearchService;
  let mockPrismaService: any;
  let mockQueryBuilderService: any;
  let mockConfigService: any;

  const mockMovies = [
    {
      id: 1,
      title: 'Test Movie',
      description: 'Test description',
      releaseYear: 2023,
      genre: 'Action',
      duration: 120,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      actors: [
        {
          actor: { id: 1, name: 'Test Actor' },
          role: 'Hero',
        },
      ],
      ratings: [{ rating: 8.5 }, { rating: 9.0 }],
    },
  ];

  const mockActors = [
    {
      id: 1,
      name: 'Test Actor',
      biography: 'Test biography',
      birthDate: new Date('1990-01-01'),
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      movies: [
        {
          movie: { id: 1, title: 'Test Movie' },
          role: 'Hero',
        },
      ],
    },
  ];

  beforeEach(async () => {
    mockPrismaService = {
      movie: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      actor: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    mockQueryBuilderService = {
      buildMovieInclude: jest.fn(),
      buildMovieWhere: jest.fn(),
      buildOrderBy: jest.fn(),
      buildPaginatedQuery: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue(10),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: QueryBuilderService, useValue: mockQueryBuilderService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should search movies and include them in results', async () => {
      mockPrismaService.movie.findMany.mockResolvedValue(mockMovies);
      mockPrismaService.movie.count.mockResolvedValue(1);
      mockPrismaService.actor.findMany.mockResolvedValue([]);
      mockPrismaService.actor.count.mockResolvedValue(0);

      const result = await service.search({
        q: 'Test',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('movie');
      expect(result.data[0].title).toBe('Test Movie');
      expect(result.data[0].averageRating).toBe(8.75);
      expect(mockPrismaService.movie.findMany).toHaveBeenCalled();
      expect(mockPrismaService.actor.findMany).toHaveBeenCalled();
    });

    it('should search actors and include them in results', async () => {
      mockPrismaService.movie.findMany.mockResolvedValue([]);
      mockPrismaService.movie.count.mockResolvedValue(0);
      mockPrismaService.actor.findMany.mockResolvedValue(mockActors);
      mockPrismaService.actor.count.mockResolvedValue(1);

      const result = await service.search({
        q: 'Test',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('actor');
      expect(result.data[0].name).toBe('Test Actor');
      expect(mockPrismaService.actor.findMany).toHaveBeenCalled();
      expect(mockPrismaService.movie.findMany).toHaveBeenCalled();
    });

    it('should search both movies and actors and include both types in results', async () => {
      mockPrismaService.movie.findMany.mockResolvedValue(mockMovies);
      mockPrismaService.movie.count.mockResolvedValue(1);
      mockPrismaService.actor.findMany.mockResolvedValue(mockActors);
      mockPrismaService.actor.count.mockResolvedValue(1);

      const result = await service.search({
        q: 'Test',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.data.some((item) => item.type === 'movie')).toBe(true);
      expect(result.data.some((item) => item.type === 'actor')).toBe(true);
      expect(mockPrismaService.movie.findMany).toHaveBeenCalled();
      expect(mockPrismaService.actor.findMany).toHaveBeenCalled();
    });

    it('should apply sorting correctly', async () => {
      const multipleMovies = [
        {
          ...mockMovies[0],
          id: 1,
          title: 'A Movie',
          ratings: [{ rating: 9.0 }],
        },
        {
          ...mockMovies[0],
          id: 2,
          title: 'B Movie',
          ratings: [{ rating: 8.0 }],
        },
      ];

      mockPrismaService.movie.findMany.mockResolvedValue(multipleMovies);
      mockPrismaService.movie.count.mockResolvedValue(2);
      mockPrismaService.actor.findMany.mockResolvedValue([]);
      mockPrismaService.actor.count.mockResolvedValue(0);

      const result = await service.search({
        q: 'Movie',
        sortBy: 'title',
        sortOrder: 'asc',
        page: 1,
        limit: 10,
      });

      expect(result.data[0].title).toBe('A Movie');
      expect(result.data[1].title).toBe('B Movie');
    });

    it('should apply pagination correctly', async () => {
      mockPrismaService.movie.findMany.mockResolvedValue([mockMovies[0]]);
      mockPrismaService.movie.count.mockResolvedValue(1);
      mockPrismaService.actor.findMany.mockResolvedValue([]);
      mockPrismaService.actor.count.mockResolvedValue(0);

      const result = await service.search({
        q: 'Test',
        page: 1,
        limit: 5,
      });

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.total).toBe(1);
    });

    it('should handle search with no results', async () => {
      mockPrismaService.movie.findMany.mockResolvedValue([]);
      mockPrismaService.movie.count.mockResolvedValue(0);
      mockPrismaService.actor.findMany.mockResolvedValue([]);
      mockPrismaService.actor.count.mockResolvedValue(0);

      const result = await service.search({
        q: 'nonexistent',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should handle movies without ratings', async () => {
      const movieWithoutRatings = {
        ...mockMovies[0],
        ratings: [],
      };

      mockPrismaService.movie.findMany.mockResolvedValue([movieWithoutRatings]);
      mockPrismaService.movie.count.mockResolvedValue(1);
      mockPrismaService.actor.findMany.mockResolvedValue([]);
      mockPrismaService.actor.count.mockResolvedValue(0);

      const result = await service.search({
        q: 'Test',
        page: 1,
        limit: 10,
      });

      expect(result.data[0].averageRating).toBeUndefined();
    });

    it('should sort by rating correctly (movies only)', async () => {
      // Note: Database sorts by ratings count, so movie with more ratings comes first
      const moviesWithRatings = [
        {
          ...mockMovies[0],
          id: 2,
          title: 'High Rated Movie',
          ratings: [{ rating: 9.0 }, { rating: 8.0 }], // More ratings
        },
        {
          ...mockMovies[0],
          id: 1,
          title: 'Low Rated Movie',
          ratings: [{ rating: 5.0 }], // Fewer ratings
        },
      ];

      // Mock returns data already sorted by database (ratings count desc)
      mockPrismaService.movie.findMany.mockResolvedValue(moviesWithRatings);
      mockPrismaService.movie.count.mockResolvedValue(2);
      mockPrismaService.actor.findMany.mockResolvedValue([]);
      mockPrismaService.actor.count.mockResolvedValue(0);

      const result = await service.search({
        q: 'Movie',
        sortBy: 'rating',
        sortOrder: 'desc',
        page: 1,
        limit: 10,
      });

      expect(result.data[0].title).toBe('High Rated Movie');
      expect(result.data[1].title).toBe('Low Rated Movie');
    });
  });
});
