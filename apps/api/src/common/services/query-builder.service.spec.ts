import { Test, TestingModule } from "@nestjs/testing";
import { QueryBuilderService } from "./query-builder.service";

describe("QueryBuilderService", () => {
  let service: QueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryBuilderService],
    }).compile();

    service = module.get<QueryBuilderService>(QueryBuilderService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("buildMovieInclude", () => {
    it("should build include with all options enabled", () => {
      const result = service.buildMovieInclude({
        includeActors: true,
        includeRatings: true,
        includeActorDetails: true,
        includeRatingDetails: true,
      });

      expect(result).toEqual({
        actors: {
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
        },
        ratings: {
          select: {
            id: true,
            rating: true,
            comment: true,
            reviewer: true,
            createdAt: true,
          },
        },
      });
    });

    it("should build include with actors only", () => {
      const result = service.buildMovieInclude({
        includeActors: true,
        includeRatings: false,
      });

      expect(result).toEqual({
        actors: {
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
        },
      });
    });

    it("should build include with ratings only", () => {
      const result = service.buildMovieInclude({
        includeActors: false,
        includeRatings: true,
      });

      expect(result).toEqual({
        ratings: {
          select: {
            id: true,
            rating: true,
            comment: true,
            reviewer: true,
            createdAt: true,
          },
        },
      });
    });

    it("should build include with no details", () => {
      const result = service.buildMovieInclude({
        includeActors: true,
        includeRatings: true,
        includeActorDetails: false,
        includeRatingDetails: false,
      });

      expect(result).toEqual({
        actors: {
          include: {
            actor: true,
          },
        },
        ratings: true,
      });
    });

    it("should build empty include when nothing is included", () => {
      const result = service.buildMovieInclude({
        includeActors: false,
        includeRatings: false,
      });

      expect(result).toEqual({});
    });
  });

  describe("buildActorInclude", () => {
    it("should build include with movies and details", () => {
      const result = service.buildActorInclude({
        includeMovies: true,
        includeMovieDetails: true,
      });

      expect(result).toEqual({
        movies: {
          include: {
            movie: {
              select: {
                id: true,
                title: true,
                releaseYear: true,
                genre: true,
                duration: true,
              },
            },
          },
        },
      });
    });

    it("should build include with movies without details", () => {
      const result = service.buildActorInclude({
        includeMovies: true,
        includeMovieDetails: false,
      });

      expect(result).toEqual({
        movies: {
          include: {
            movie: true,
          },
        },
      });
    });

    it("should build empty include when movies not included", () => {
      const result = service.buildActorInclude({
        includeMovies: false,
      });

      expect(result).toEqual({});
    });
  });

  describe("buildMovieWhere", () => {
    it("should build where clause with search term", () => {
      const result = service.buildMovieWhere({
        search: "inception",
      });

      expect(result).toEqual({
        OR: [
          { title: { contains: "inception", mode: "insensitive" } },
          { description: { contains: "inception", mode: "insensitive" } },
        ],
      });
    });

    it("should build where clause with genre filter", () => {
      const result = service.buildMovieWhere({
        genre: "Action",
      });

      expect(result).toEqual({
        genre: { equals: "Action", mode: "insensitive" },
      });
    });

    it("should build where clause with release year filter", () => {
      const result = service.buildMovieWhere({
        releaseYear: 2023,
      });

      expect(result).toEqual({
        releaseYear: 2023,
      });
    });

    it("should build where clause with rating range", () => {
      const result = service.buildMovieWhere({
        minRating: 7.0,
        maxRating: 9.0,
      });

      expect(result).toEqual({
        ratings: {
          some: {
            rating: {
              gte: 7.0,
              lte: 9.0,
            },
          },
        },
      });
    });

    it("should build where clause with minRating only", () => {
      const result = service.buildMovieWhere({
        minRating: 7.0,
      });

      expect(result).toEqual({
        ratings: {
          some: {
            rating: {
              gte: 7.0,
            },
          },
        },
      });
    });

    it("should build where clause with maxRating only", () => {
      const result = service.buildMovieWhere({
        maxRating: 9.0,
      });

      expect(result).toEqual({
        ratings: {
          some: {
            rating: {
              lte: 9.0,
            },
          },
        },
      });
    });

    it("should build where clause with multiple filters", () => {
      const result = service.buildMovieWhere({
        search: "action",
        genre: "Action",
        releaseYear: 2023,
        minRating: 8.0,
        maxRating: 10.0,
      });

      expect(result).toEqual({
        OR: [
          { title: { contains: "action", mode: "insensitive" } },
          { description: { contains: "action", mode: "insensitive" } },
        ],
        genre: { equals: "Action", mode: "insensitive" },
        releaseYear: 2023,
        ratings: {
          some: {
            rating: {
              gte: 8.0,
              lte: 10.0,
            },
          },
        },
      });
    });

    it("should build empty where clause when no filters provided", () => {
      const result = service.buildMovieWhere({});

      expect(result).toEqual({});
    });
  });

  describe("buildActorWhere", () => {
    it("should build where clause with search term", () => {
      const result = service.buildActorWhere({
        search: "leonardo",
      });

      expect(result).toEqual({
        OR: [
          { name: { contains: "leonardo", mode: "insensitive" } },
          { biography: { contains: "leonardo", mode: "insensitive" } },
        ],
      });
    });

    it("should build where clause with birth year range", () => {
      const result = service.buildActorWhere({
        birthYearFrom: 1970,
        birthYearTo: 1980,
      });

      expect(result).toEqual({
        birthDate: {
          gte: new Date("1970-01-01"),
          lte: new Date("1980-12-31"),
        },
      });
    });

    it("should build where clause with multiple filters", () => {
      const result = service.buildActorWhere({
        search: "tom",
        birthYearFrom: 1960,
        birthYearTo: 1970,
      });

      expect(result).toEqual({
        OR: [
          { name: { contains: "tom", mode: "insensitive" } },
          { biography: { contains: "tom", mode: "insensitive" } },
        ],
        birthDate: {
          gte: new Date("1960-01-01"),
          lte: new Date("1970-12-31"),
        },
      });
    });

    it("should build empty where clause when no filters provided", () => {
      const result = service.buildActorWhere({});

      expect(result).toEqual({});
    });
  });

  describe("buildOrderBy", () => {
    it("should build order by with provided field and order", () => {
      const result = service.buildOrderBy("title", "asc", {
        createdAt: "desc" as const,
      });

      expect(result).toEqual({
        title: "asc",
      });
    });

    it("should return default sort when no sortBy provided", () => {
      const defaultSort = { createdAt: "desc" as const };
      const result = service.buildOrderBy(undefined, "asc", defaultSort);

      expect(result).toEqual(defaultSort);
    });

    it("should handle desc order", () => {
      const result = service.buildOrderBy("releaseYear", "desc", {});

      expect(result).toEqual({
        releaseYear: "desc",
      });
    });
  });

  describe("buildPagination", () => {
    it("should build pagination with default values", () => {
      const result = service.buildPagination();

      expect(result).toEqual({
        skip: 0,
        take: 10,
      });
    });

    it("should build pagination with custom page and limit", () => {
      const result = service.buildPagination(3, 20);

      expect(result).toEqual({
        skip: 40,
        take: 20,
      });
    });

    it("should handle first page correctly", () => {
      const result = service.buildPagination(1, 15);

      expect(result).toEqual({
        skip: 0,
        take: 15,
      });
    });
  });

  describe("buildPaginatedQuery", () => {
    it("should build complete paginated query with all options", () => {
      const include = { actors: true };
      const where = { title: { contains: "test" } };
      const orderBy = { createdAt: "desc" as const };

      const result = service.buildPaginatedQuery({
        page: 2,
        limit: 15,
        include,
        where,
        orderBy,
      });

      expect(result).toEqual({
        skip: 15,
        take: 15,
        include,
        where,
        orderBy,
      });
    });

    it("should build paginated query with defaults", () => {
      const result = service.buildPaginatedQuery({});

      expect(result).toEqual({
        skip: 0,
        take: 10,
      });
    });

    it("should build paginated query with only pagination", () => {
      const result = service.buildPaginatedQuery({
        page: 3,
        limit: 5,
      });

      expect(result).toEqual({
        skip: 10,
        take: 5,
      });
    });
  });
});
