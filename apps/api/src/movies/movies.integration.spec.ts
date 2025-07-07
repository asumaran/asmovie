/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../common/prisma.service';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { PerformanceInterceptor } from '../common/interceptors/performance.interceptor';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import * as dotenv from 'dotenv';
dotenv.config();

// API token for testing protected endpoints
const API_TOKEN =
  process.env.API_TOKEN ??
  'your-super-secure-api-secret-key-here-at-least-32-characters-long';

describe('Movies Integration Tests', () => {
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
    // Clean up after all tests
    await prismaService.movieRating.deleteMany();
    await prismaService.movieActor.deleteMany();
    await prismaService.movie.deleteMany();
    await prismaService.actor.deleteMany();
    await prismaService.$disconnect();
    await app.close();
  });

  describe('POST /movies', () => {
    it('should create a new movie', async () => {
      const movieData = {
        title: 'Test Movie',
        description: 'A test movie description',
        releaseYear: 2023,
        genre: 'Action',
        duration: 120,
      };

      const response = await request(app.getHttpServer())
        .post('/movies')
        .set('X-API-Token', API_TOKEN)
        .send(movieData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: expect.any(Number),
          title: 'Test Movie',
          description: 'A test movie description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
        message: 'Success',
        timestamp: expect.any(String),
      });
    });

    it('should validate required fields', async () => {
      const invalidMovie = {
        description: 'Missing title',
      };

      const response = await request(app.getHttpServer())
        .post('/movies')
        .set('X-API-Token', API_TOKEN)
        .send(invalidMovie)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: expect.any(Array),
        errors: expect.any(Array),
      });
    });

    it('should validate field types and constraints', async () => {
      const invalidMovie = {
        title: '', // Empty string
        releaseYear: 'not-a-number',
        duration: -10, // Negative duration
      };

      const response = await request(app.getHttpServer())
        .post('/movies')
        .set('X-API-Token', API_TOKEN)
        .send(invalidMovie)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /movies', () => {
    beforeEach(async () => {
      // Create test data
      const movies = [
        {
          title: 'Action Movie 1',
          description: 'First action movie',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
        {
          title: 'Drama Movie 1',
          description: 'First drama movie',
          releaseYear: 2022,
          genre: 'Drama',
          duration: 135,
        },
        {
          title: 'Action Movie 2',
          description: 'Second action movie',
          releaseYear: 2023,
          genre: 'Action',
          duration: 110,
        },
        {
          title: 'Comedy Movie 1',
          description: 'Funny movie',
          releaseYear: 2021,
          genre: 'Comedy',
          duration: 95,
        },
        {
          title: 'Sci-Fi Adventure',
          description: 'Space exploration movie',
          releaseYear: 2023,
          genre: 'Sci-Fi',
          duration: 140,
        },
      ];

      for (const movie of movies) {
        await prismaService.movie.create({ data: movie });
      }
    });

    it('should return paginated movies with default pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        meta: {
          page: 1,
          limit: 10,
          total: 5,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        message: 'Success',
      });

      expect(response.body.data).toHaveLength(5);
    });

    it('should support custom pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies?page=2&limit=2')
        .expect(200);

      expect(response.body.meta).toMatchObject({
        page: 2,
        limit: 2,
        total: 5,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });

      expect(response.body.data).toHaveLength(2);
    });

    it('should filter movies by genre', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies?genre=Action')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(
        response.body.data.every((movie) => movie.genre === 'Action'),
      ).toBe(true);
    });

    it('should filter movies by release year', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies?releaseYear=2023')
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(
        response.body.data.every((movie) => movie.releaseYear === 2023),
      ).toBe(true);
    });

    it('should search movies by title', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies?search=Drama')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toContain('Drama');
    });

    it('should search movies by description', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies?search=space')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].description).toContain('Space');
    });

    it('should combine multiple filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies?genre=Action&releaseYear=2023&page=1&limit=5')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(
        response.body.data.every(
          (movie) => movie.genre === 'Action' && movie.releaseYear === 2023,
        ),
      ).toBe(true);
    });

    it('should return empty results for non-matching filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies?genre=Horror')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.total).toBe(0);
    });

    it('should validate pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies?page=0&limit=0')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle large page numbers gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies?page=100&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta).toMatchObject({
        page: 100,
        limit: 10,
        total: 5,
        totalPages: 1,
        hasNext: false,
        hasPrev: true,
      });
    });
  });

  describe('GET /movies/:id', () => {
    let createdMovie: any;

    beforeEach(async () => {
      createdMovie = await prismaService.movie.create({
        data: {
          title: 'Test Movie',
          description: 'Test description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });
    });

    it('should return a specific movie by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/movies/${createdMovie.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: createdMovie.id,
          title: 'Test Movie',
          description: 'Test description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
        message: 'Success',
      });
    });

    it('should return 404 for non-existent movie', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/999999')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: "Movie with identifier '999999' not found",
      });
    });

    it('should validate ID parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /movies/:id', () => {
    let createdMovie: any;

    beforeEach(async () => {
      createdMovie = await prismaService.movie.create({
        data: {
          title: 'Original Title',
          description: 'Original description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });
    });

    it('should update a movie', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/movies/${createdMovie.id}`)
        .set('X-API-Token', API_TOKEN)
        .send(updateData)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: createdMovie.id,
        title: 'Updated Title',
        description: 'Updated description',
        releaseYear: 2023, // Should remain unchanged
        genre: 'Action', // Should remain unchanged
        duration: 120, // Should remain unchanged
      });
    });

    it('should return 404 when updating non-existent movie', async () => {
      const response = await request(app.getHttpServer())
        .patch('/movies/999999')
        .set('X-API-Token', API_TOKEN)
        .send({ title: 'New Title' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should validate update data', async () => {
      const invalidUpdate = {
        releaseYear: 'not-a-number',
        duration: -50,
      };

      const response = await request(app.getHttpServer())
        .patch(`/movies/${createdMovie.id}`)
        .set('X-API-Token', API_TOKEN)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /movies/:id', () => {
    let createdMovie: any;

    beforeEach(async () => {
      createdMovie = await prismaService.movie.create({
        data: {
          title: 'Movie to Delete',
          description: 'This movie will be deleted',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });
    });

    it('should delete a movie', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/movies/${createdMovie.id}`)
        .set('X-API-Token', API_TOKEN)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify movie is deleted
      const deletedMovie = await prismaService.movie.findUnique({
        where: { id: createdMovie.id },
      });
      expect(deletedMovie).toBeNull();
    });

    it('should return 404 when deleting non-existent movie', async () => {
      const response = await request(app.getHttpServer())
        .delete('/movies/999999')
        .set('X-API-Token', API_TOKEN)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Movie-Actor relationships', () => {
    let createdMovie: any;
    let createdActor: any;

    beforeEach(async () => {
      createdMovie = await prismaService.movie.create({
        data: {
          title: 'Test Movie',
          description: 'Test description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });

      createdActor = await prismaService.actor.create({
        data: {
          name: 'Test Actor',
          biography: 'Test actor biography',
          birthDate: new Date('1990-01-01'),
        },
      });
    });

    describe('POST /movies/:id/actors', () => {
      it('should add an actor to a movie', async () => {
        const addActorData = {
          actorId: createdActor.id,
          role: 'Lead Actor',
        };

        const response = await request(app.getHttpServer())
          .post(`/movies/${createdMovie.id}/actors`)
          .set('X-API-Token', API_TOKEN)
          .send(addActorData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.actors).toHaveLength(1);
        expect(response.body.data.actors[0]).toMatchObject({
          actorId: createdActor.id,
          role: 'Lead Actor',
          actor: {
            id: createdActor.id,
            name: 'Test Actor',
          },
        });
      });

      it('should return 404 for non-existent movie', async () => {
        const response = await request(app.getHttpServer())
          .post('/movies/999999/actors')
          .set('X-API-Token', API_TOKEN)
          .send({ actorId: createdActor.id, role: 'Lead' })
          .expect(404);

        expect(response.body.success).toBe(false);
      });

      it('should return 404 for non-existent actor', async () => {
        const response = await request(app.getHttpServer())
          .post(`/movies/${createdMovie.id}/actors`)
          .set('X-API-Token', API_TOKEN)
          .send({ actorId: 999999, role: 'Lead' })
          .expect(404);

        expect(response.body.success).toBe(false);
      });

      it('should handle duplicate actor assignment', async () => {
        // First assignment
        await request(app.getHttpServer())
          .post(`/movies/${createdMovie.id}/actors`)
          .set('X-API-Token', API_TOKEN)
          .send({ actorId: createdActor.id, role: 'Lead' })
          .expect(201);

        // Duplicate assignment
        const response = await request(app.getHttpServer())
          .post(`/movies/${createdMovie.id}/actors`)
          .set('X-API-Token', API_TOKEN)
          .send({ actorId: createdActor.id, role: 'Supporting' })
          .expect(409);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /movies/:id/actors', () => {
      beforeEach(async () => {
        // Add actor to movie
        await prismaService.movieActor.create({
          data: {
            movieId: createdMovie.id,
            actorId: createdActor.id,
            role: 'Lead Actor',
          },
        });
      });

      it('should return actors for a movie', async () => {
        const response = await request(app.getHttpServer())
          .get(`/movies/${createdMovie.id}/actors`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0]).toMatchObject({
          actorId: createdActor.id,
          role: 'Lead Actor',
          actor: {
            id: createdActor.id,
            name: 'Test Actor',
          },
        });
      });

      it('should return empty array for movie with no actors', async () => {
        const newMovie = await prismaService.movie.create({
          data: {
            title: 'Movie without actors',
            description: 'Test',
            releaseYear: 2023,
            genre: 'Drama',
            duration: 90,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/movies/${newMovie.id}/actors`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(0);
      });
    });

    describe('DELETE /movies/:movieId/actors/:actorId', () => {
      beforeEach(async () => {
        // Add actor to movie
        await prismaService.movieActor.create({
          data: {
            movieId: createdMovie.id,
            actorId: createdActor.id,
            role: 'Lead Actor',
          },
        });
      });

      it('should remove an actor from a movie', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/movies/${createdMovie.id}/actors/${createdActor.id}`)
          .set('X-API-Token', API_TOKEN)
          .expect(200);

        expect(response.body.success).toBe(true);

        // Verify relationship is removed
        const relationship = await prismaService.movieActor.findFirst({
          where: {
            movieId: createdMovie.id,
            actorId: createdActor.id,
          },
        });
        expect(relationship).toBeNull();
      });

      it('should return 404 for non-existent relationship', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/movies/${createdMovie.id}/actors/999999`)
          .set('X-API-Token', API_TOKEN)
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Response format and interceptors', () => {
    let createdMovie: any;

    beforeEach(async () => {
      createdMovie = await prismaService.movie.create({
        data: {
          title: 'Test Movie',
          description: 'Test description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });
    });

    it('should apply ResponseInterceptor to all endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get(`/movies/${createdMovie.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Success');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it('should apply pagination meta for list endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies')
        .expect(200);

      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('totalPages');
      expect(response.body.meta).toHaveProperty('hasNext');
      expect(response.body.meta).toHaveProperty('hasPrev');
    });

    it('should apply HttpExceptionFilter for errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/999999')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        data: null,
        message: "Movie with identifier '999999' not found",
        timestamp: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        ),
        path: '/movies/999999',
      });
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle concurrent requests', async () => {
      const movieData = {
        title: 'Concurrent Movie',
        description: 'Test concurrent creation',
        releaseYear: 2023,
        genre: 'Action',
        duration: 120,
      };

      const promises = Array.from({ length: 5 }, (_, i) =>
        request(app.getHttpServer())
          .post('/movies')
          .set('X-API-Token', API_TOKEN)
          .send({ ...movieData, title: `${movieData.title} ${i}` }),
      );

      const responses = await Promise.all(promises);

      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(`Concurrent Movie ${index}`);
      });
    });

    it('should handle special characters in search', async () => {
      await prismaService.movie.create({
        data: {
          title: 'Movie with "Quotes" & Symbols!',
          description: 'Special characters: @#$%^&*()',
          releaseYear: 2023,
          genre: 'Comedy',
          duration: 100,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/movies?search=Quotes')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toContain('Quotes');
    });

    it('should handle very long movie descriptions', async () => {
      const longDescription = 'A'.repeat(5000);
      const movieData = {
        title: 'Movie with Long Description',
        description: longDescription,
        releaseYear: 2023,
        genre: 'Epic',
        duration: 180,
      };

      const response = await request(app.getHttpServer())
        .post('/movies')
        .set('X-API-Token', API_TOKEN)
        .send(movieData)
        .expect(201);

      expect(response.body.data.description).toBe(longDescription);
    });
  });
});
