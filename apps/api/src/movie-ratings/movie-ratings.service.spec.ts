import { Test, TestingModule } from "@nestjs/testing";
import { MovieRatingsService } from "./movie-ratings.service";
import { PrismaService } from "../common/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("MovieRatingsService", () => {
  let service: MovieRatingsService;

  const mockPrismaService = {
    movieRating: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
    movie: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieRatingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MovieRatingsService>(MovieRatingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a movie rating", async () => {
      const createRatingDto = {
        movieId: 1,
        reviewer: "user1",
        rating: 8.5,
        comment: "Great movie!",
      };

      const mockMovie = { id: 1, title: "Test Movie" };
      const expectedRating = {
        id: 1,
        ...createRatingDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        movie: mockMovie,
      };

      mockPrismaService.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrismaService.movieRating.create.mockResolvedValue(expectedRating);

      const result = await service.create(createRatingDto);

      expect(mockPrismaService.movie.findUnique).toHaveBeenCalledWith({
        where: { id: createRatingDto.movieId },
      });
      expect(mockPrismaService.movieRating.create).toHaveBeenCalledWith({
        data: createRatingDto,
        include: {
          movie: true,
        },
      });
      expect(result).toEqual(expectedRating);
    });

    it("should throw NotFoundException if movie not found", async () => {
      const createRatingDto = {
        movieId: 999,
        reviewer: "user1",
        rating: 8.5,
        comment: "Great movie!",
      };

      mockPrismaService.movie.findUnique.mockResolvedValue(null);

      await expect(service.create(createRatingDto)).rejects.toThrow(
        new NotFoundException(
          `Movie with ID ${createRatingDto.movieId} not found`,
        ),
      );
    });
  });

  describe("findAll", () => {
    it("should return all ratings", async () => {
      const expectedRatings = [
        {
          id: 1,
          movieId: 1,
          userId: "user1",
          rating: 8.5,
          review: "Great movie!",
          movie: { id: 1, title: "Test Movie" },
        },
      ];

      mockPrismaService.movieRating.findMany.mockResolvedValue(expectedRatings);

      const result = await service.findAll();

      expect(mockPrismaService.movieRating.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          movie: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      expect(result).toEqual(expectedRatings);
    });
  });

  describe("findOne", () => {
    it("should return a rating by id", async () => {
      const ratingId = 1;
      const expectedRating = {
        id: ratingId,
        movieId: 1,
        userId: "user1",
        rating: 8.5,
        review: "Great movie!",
        movie: { id: 1, title: "Test Movie" },
      };

      mockPrismaService.movieRating.findUnique.mockResolvedValue(
        expectedRating,
      );

      const result = await service.findOne(ratingId);

      expect(mockPrismaService.movieRating.findUnique).toHaveBeenCalledWith({
        where: { id: ratingId },
        include: {
          movie: true,
        },
      });
      expect(result).toEqual(expectedRating);
    });

    it("should throw NotFoundException if rating not found", async () => {
      const ratingId = 999;

      mockPrismaService.movieRating.findUnique.mockResolvedValue(null);

      await expect(service.findOne(ratingId)).rejects.toThrow(
        new NotFoundException(`Movie rating with ID ${ratingId} not found`),
      );
    });
  });

  describe("update", () => {
    it("should update a rating", async () => {
      const ratingId = 1;
      const updateRatingDto = {
        rating: 9.0,
        review: "Amazing movie!",
      };

      const existingRating = {
        id: ratingId,
        movieId: 1,
        userId: "user1",
        rating: 8.5,
        review: "Great movie!",
        movie: { id: 1, title: "Test Movie" },
      };

      const updatedRating = {
        ...existingRating,
        ...updateRatingDto,
      };

      mockPrismaService.movieRating.findUnique.mockResolvedValue(
        existingRating,
      );
      mockPrismaService.movieRating.update.mockResolvedValue(updatedRating);

      const result = await service.update(ratingId, updateRatingDto);

      expect(mockPrismaService.movieRating.update).toHaveBeenCalledWith({
        where: { id: ratingId },
        data: updateRatingDto,
        include: {
          movie: true,
        },
      });
      expect(result).toEqual(updatedRating);
    });

    it("should throw NotFoundException if rating not found", async () => {
      const ratingId = 999;
      const updateRatingDto = { rating: 9.0 };

      mockPrismaService.movieRating.findUnique.mockResolvedValue(null);

      await expect(service.update(ratingId, updateRatingDto)).rejects.toThrow(
        new NotFoundException(`Movie rating with ID ${ratingId} not found`),
      );
    });
  });

  describe("remove", () => {
    it("should remove a rating", async () => {
      const ratingId = 1;
      const mockRating = {
        id: ratingId,
        movieId: 1,
        userId: "user1",
        rating: 8.5,
        review: "Great movie!",
      };

      mockPrismaService.movieRating.findUnique.mockResolvedValue(mockRating);
      mockPrismaService.movieRating.delete.mockResolvedValue(mockRating);

      const result = await service.remove(ratingId);

      expect(mockPrismaService.movieRating.delete).toHaveBeenCalledWith({
        where: { id: ratingId },
      });
      expect(result).toEqual(mockRating);
    });

    it("should throw NotFoundException if rating not found", async () => {
      const ratingId = 999;

      mockPrismaService.movieRating.findUnique.mockResolvedValue(null);

      await expect(service.remove(ratingId)).rejects.toThrow(
        new NotFoundException(`Movie rating with ID ${ratingId} not found`),
      );
    });
  });

  describe("getMovieRatings", () => {
    it("should return ratings for a specific movie", async () => {
      const movieId = 1;
      const mockMovie = { id: movieId, title: "Test Movie" };
      const expectedRatings = [
        {
          id: 1,
          movieId,
          reviewer: "user1",
          rating: 8.5,
          comment: "Great movie!",
        },
        {
          id: 2,
          movieId,
          reviewer: "user2",
          rating: 9.0,
          comment: "Amazing!",
        },
      ];

      mockPrismaService.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrismaService.movieRating.findMany.mockResolvedValue(expectedRatings);

      const result = await service.getMovieRatings(movieId);

      expect(mockPrismaService.movie.findUnique).toHaveBeenCalledWith({
        where: { id: movieId },
      });
      expect(mockPrismaService.movieRating.findMany).toHaveBeenCalledWith({
        where: { movieId },
        orderBy: {
          createdAt: "desc",
        },
      });
      expect(result).toEqual(expectedRatings);
    });

    it("should throw NotFoundException if movie not found", async () => {
      const movieId = 999;

      mockPrismaService.movie.findUnique.mockResolvedValue(null);

      await expect(service.getMovieRatings(movieId)).rejects.toThrow(
        new NotFoundException(`Movie with ID ${movieId} not found`),
      );
    });
  });

  describe("getAverageRating", () => {
    it("should return average rating for a movie", async () => {
      const movieId = 1;
      const mockMovie = { id: movieId, title: "Test Movie" };
      const mockAggregate = {
        _avg: { rating: 8.75 },
        _count: { rating: 4 },
      };
      const expectedResult = {
        movieId,
        averageRating: 8.75,
        totalRatings: 4,
      };

      mockPrismaService.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrismaService.movieRating.aggregate = jest
        .fn()
        .mockResolvedValue(mockAggregate);

      const result = await service.getAverageRating(movieId);

      expect(mockPrismaService.movie.findUnique).toHaveBeenCalledWith({
        where: { id: movieId },
      });
      expect(mockPrismaService.movieRating.aggregate).toHaveBeenCalledWith({
        where: { movieId },
        _avg: { rating: true },
        _count: { rating: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it("should return 0 average if no ratings exist", async () => {
      const movieId = 1;
      const mockMovie = { id: movieId, title: "Test Movie" };
      const mockAggregate = {
        _avg: { rating: null },
        _count: { rating: 0 },
      };
      const expectedResult = {
        movieId,
        averageRating: 0,
        totalRatings: 0,
      };

      mockPrismaService.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrismaService.movieRating.aggregate = jest
        .fn()
        .mockResolvedValue(mockAggregate);

      const result = await service.getAverageRating(movieId);

      expect(result).toEqual(expectedResult);
    });

    it("should throw NotFoundException if movie not found", async () => {
      const movieId = 999;

      mockPrismaService.movie.findUnique.mockResolvedValue(null);

      await expect(service.getAverageRating(movieId)).rejects.toThrow(
        new NotFoundException(`Movie with ID ${movieId} not found`),
      );
    });
  });
});
