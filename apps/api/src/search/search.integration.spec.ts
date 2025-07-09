/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../app.module";
import { PrismaService } from "../common/prisma.service";
import { ResponseInterceptor } from "../common/interceptors/response.interceptor";
import { PerformanceInterceptor } from "../common/interceptors/performance.interceptor";
import { HttpExceptionFilter } from "../common/filters/http-exception.filter";
import * as dotenv from "dotenv";
dotenv.config();

// API token for testing protected endpoints
const API_TOKEN =
  process.env.API_TOKEN ??
  "your-super-secure-api-secret-key-here-at-least-32-characters-long";

describe("Search Integration Tests", () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same configuration as in main.ts
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalInterceptors(new PerformanceInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prismaService.movieRating.deleteMany();
    await prismaService.movieActor.deleteMany();
    await prismaService.movie.deleteMany();
    await prismaService.actor.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /search", () => {
    it("should return 400 when query parameter is missing", async () => {
      const response = await request(app.getHttpServer())
        .get("/search")
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("q should not be empty");
    });

    it("should return 400 when query parameter is empty", async () => {
      const response = await request(app.getHttpServer())
        .get("/search?q=")
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("q should not be empty");
    });

    it("should return 400 when limit is not in allowed values", async () => {
      const response = await request(app.getHttpServer())
        .get("/search?q=test&limit=25")
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "limit must be one of the following values: 5, 10, 15, 20",
      );
    });

    it("should return 400 when sortBy is invalid", async () => {
      const response = await request(app.getHttpServer())
        .get("/search?q=test&sortBy=invalid")
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "sortBy must be one of the following values: title, name, rating, releaseYear, createdAt, director, budget, boxOffice, nationality",
      );
    });

    it("should return 400 when sortOrder is invalid", async () => {
      const response = await request(app.getHttpServer())
        .get("/search?q=test&sortOrder=invalid")
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "sortOrder must be one of the following values: asc, desc",
      );
    });

    it("should return empty results when no matches found", async () => {
      const response = await request(app.getHttpServer())
        .get("/search?q=nonexistent")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
    });

    it("should search movies by title", async () => {
      // Create test movie
      const movie = await prismaService.movie.create({
        data: {
          title: "Test Movie",
          description: "A test movie",
          releaseYear: 2023,
          genre: "Action",
          duration: 120,
        },
      });

      const response = await request(app.getHttpServer())
        .get("/search?q=Test Movie")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe("movie");
      expect(response.body.data[0].title).toBe("Test Movie");
      expect(response.body.data[0].id).toBe(movie.id);
    });

    it("should search actors by name", async () => {
      // Create test actor
      const actor = await prismaService.actor.create({
        data: {
          name: "Test Actor",
          biography: "A test actor",
          birthDate: new Date("1990-01-01"),
        },
      });

      const response = await request(app.getHttpServer())
        .get("/search?q=Test Actor")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe("actor");
      expect(response.body.data[0].name).toBe("Test Actor");
      expect(response.body.data[0].id).toBe(actor.id);
    });

    it("should search both movies and actors", async () => {
      // Create test movie
      await prismaService.movie.create({
        data: {
          title: "Awesome Movie",
          description: "An awesome movie",
          releaseYear: 2023,
          genre: "Action",
          duration: 120,
        },
      });

      // Create test actor
      await prismaService.actor.create({
        data: {
          name: "Awesome Actor",
          biography: "An awesome actor",
          birthDate: new Date("1990-01-01"),
        },
      });

      const response = await request(app.getHttpServer())
        .get("/search?q=Awesome")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(
        response.body.data.some((item: any) => item.type === "movie"),
      ).toBe(true);
      expect(
        response.body.data.some((item: any) => item.type === "actor"),
      ).toBe(true);
    });

    it("should apply pagination correctly", async () => {
      // Create multiple test movies
      for (let i = 1; i <= 15; i++) {
        await prismaService.movie.create({
          data: {
            title: `Movie ${i}`,
            description: `Movie ${i} description`,
            releaseYear: 2023,
            genre: "Action",
            duration: 120,
          },
        });
      }

      const response = await request(app.getHttpServer())
        .get("/search?q=Movie&page=2&limit=10")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.total).toBe(15);
      expect(response.body.meta.totalPages).toBe(2);
      expect(response.body.meta.hasNext).toBe(false);
      expect(response.body.meta.hasPrev).toBe(true);
    });

    it("should sort movies by title ascending", async () => {
      // Create test movies
      await prismaService.movie.create({
        data: {
          title: "Z Movie",
          description: "Last movie",
          releaseYear: 2023,
          genre: "Action",
          duration: 120,
        },
      });

      await prismaService.movie.create({
        data: {
          title: "A Movie",
          description: "First movie",
          releaseYear: 2023,
          genre: "Action",
          duration: 120,
        },
      });

      const response = await request(app.getHttpServer())
        .get("/search?q=Movie&sortBy=title&sortOrder=asc")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].title).toBe("A Movie");
      expect(response.body.data[1].title).toBe("Z Movie");
    });

    it("should include movie ratings in search results", async () => {
      // Create test movie
      const movie = await prismaService.movie.create({
        data: {
          title: "Rated Movie",
          description: "A rated movie",
          releaseYear: 2023,
          genre: "Action",
          duration: 120,
        },
      });

      // Add ratings
      await prismaService.movieRating.create({
        data: {
          movieId: movie.id,
          rating: 8.5,
          reviewer: "Test Reviewer",
          comment: "Great movie",
        },
      });

      await prismaService.movieRating.create({
        data: {
          movieId: movie.id,
          rating: 9.0,
          reviewer: "Another Reviewer",
          comment: "Excellent",
        },
      });

      const response = await request(app.getHttpServer())
        .get("/search?q=Rated")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].averageRating).toBe(8.75);
    });

    it("should include actor-movie relationships in search results", async () => {
      // Create test actor
      const actor = await prismaService.actor.create({
        data: {
          name: "Connected Actor",
          biography: "An actor with movies",
          birthDate: new Date("1990-01-01"),
        },
      });

      // Create test movie
      const movie = await prismaService.movie.create({
        data: {
          title: "Connected Movie",
          description: "A movie with actors",
          releaseYear: 2023,
          genre: "Action",
          duration: 120,
        },
      });

      // Connect actor to movie
      await prismaService.movieActor.create({
        data: {
          actorId: actor.id,
          movieId: movie.id,
          role: "Main Character",
        },
      });

      const response = await request(app.getHttpServer())
        .get("/search?q=Connected")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);

      const movieResult = response.body.data.find(
        (item: any) => item.type === "movie",
      );
      const actorResult = response.body.data.find(
        (item: any) => item.type === "actor",
      );

      expect(movieResult.actors).toHaveLength(1);
      expect(movieResult.actors[0].name).toBe("Connected Actor");
      expect(movieResult.actors[0].role).toBe("Main Character");

      expect(actorResult.movies).toHaveLength(1);
      expect(actorResult.movies[0].title).toBe("Connected Movie");
      expect(actorResult.movies[0].role).toBe("Main Character");
    });

    it("should respect different page sizes", async () => {
      // Create test movies
      for (let i = 1; i <= 10; i++) {
        await prismaService.movie.create({
          data: {
            title: `Page Movie ${i}`,
            description: `Page movie ${i} description`,
            releaseYear: 2023,
            genre: "Action",
            duration: 120,
          },
        });
      }

      const response5 = await request(app.getHttpServer())
        .get("/search?q=Page&limit=5")
        .expect(200);

      expect(response5.body.data).toHaveLength(5);
      expect(response5.body.meta.limit).toBe(5);
      expect(response5.body.meta.totalPages).toBe(2);

      const response15 = await request(app.getHttpServer())
        .get("/search?q=Page&limit=15")
        .expect(200);

      expect(response15.body.data).toHaveLength(10);
      expect(response15.body.meta.limit).toBe(15);
      expect(response15.body.meta.totalPages).toBe(1);
    });
  });
});
