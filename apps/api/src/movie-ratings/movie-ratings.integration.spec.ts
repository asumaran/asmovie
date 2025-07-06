import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../common/prisma.service';

const API_TOKEN = 'test-api-secret-key-for-integration-tests';

describe('Movie Ratings Integration Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prismaService.movieRating.deleteMany();
    await prismaService.movieActor.deleteMany();
    await prismaService.movie.deleteMany();
    await prismaService.actor.deleteMany();
  });

  describe('POST /movie-ratings', () => {
    let movie: any;

    beforeEach(async () => {
      movie = await prismaService.movie.create({
        data: {
          title: 'Test Movie',
          description: 'Test description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });
    });

    it('should create a new movie rating with valid token', async () => {
      const createRatingDto = {
        movieId: movie.id,
        rating: 8.5,
        comment: 'Great movie!',
        reviewer: 'Test Reviewer',
      };

      const response = await request(app.getHttpServer())
        .post('/movie-ratings')
        .set('X-API-Token', API_TOKEN)
        .send(createRatingDto)
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.rating).toBe(8.5);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.comment).toBe('Great movie!');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.movieId).toBe(movie.id);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.id).toBeDefined();
    });

    it('should return 401 when no token is provided', async () => {
      const createRatingDto = {
        movieId: movie.id,
        rating: 8.5,
        comment: 'Great movie!',
        reviewer: 'Test Reviewer',
      };

      await request(app.getHttpServer())
        .post('/movie-ratings')
        .send(createRatingDto)
        .expect(401);
    });

    it('should return 401 when invalid token is provided', async () => {
      const createRatingDto = {
        movieId: movie.id,
        rating: 8.5,
        comment: 'Great movie!',
        reviewer: 'Test Reviewer',
      };

      await request(app.getHttpServer())
        .post('/movie-ratings')
        .set('X-API-Token', 'invalid-token')
        .send(createRatingDto)
        .expect(401);
    });

    it('should return 400 for invalid rating data', async () => {
      const invalidRatingDto = {
        movieId: movie.id,
        rating: 11, // rating should be between 1-10
        comment: 'Great movie!',
        reviewer: 'Test Reviewer',
      };

      await request(app.getHttpServer())
        .post('/movie-ratings')
        .set('X-API-Token', API_TOKEN)
        .send(invalidRatingDto)
        .expect(400);
    });
  });

  describe('GET /movie-ratings', () => {
    beforeEach(async () => {
      const movie = await prismaService.movie.create({
        data: {
          title: 'Test Movie',
          description: 'Test description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });

      await prismaService.movieRating.create({
        data: {
          movieId: movie.id,
          rating: 8.5,
          comment: 'Great movie!',
          reviewer: 'Test Reviewer',
        },
      });
    });

    it('should get all movie ratings without token (read operation)', async () => {
      const response = await request(app.getHttpServer())
        .get('/movie-ratings')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body[0].rating).toBe(8.5);
    });

    it('should filter ratings by movie ID', async () => {
      const movie1 = await prismaService.movie.create({
        data: {
          title: 'Movie 1',
          description: 'Description 1',
          releaseYear: 2022,
          genre: 'Drama',
          duration: 110,
        },
      });

      const movie2 = await prismaService.movie.create({
        data: {
          title: 'Movie 2',
          description: 'Description 2',
          releaseYear: 2021,
          genre: 'Comedy',
          duration: 95,
        },
      });

      await prismaService.movieRating.createMany({
        data: [
          {
            movieId: movie1.id,
            rating: 8.5,
            comment: 'Good movie!',
            reviewer: 'Reviewer 1',
          },
          {
            movieId: movie2.id,
            rating: 7.0,
            comment: 'Okay movie',
            reviewer: 'Reviewer 2',
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get(`/movie-ratings?movieId=${movie1.id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body[0].rating).toBe(8.5);
    });

    it('should return 400 for invalid movieId parameter', async () => {
      await request(app.getHttpServer())
        .get('/movie-ratings?movieId=invalid')
        .expect(400);
    });
  });

  describe('GET /movie-ratings/movie/:movieId/average', () => {
    let movie: any;

    beforeEach(async () => {
      movie = await prismaService.movie.create({
        data: {
          title: 'Test Movie',
          description: 'Test description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });
    });

    it('should get average rating for a movie without token (read operation)', async () => {
      await prismaService.movieRating.createMany({
        data: [
          {
            movieId: movie.id,
            rating: 8.0,
            comment: 'Good movie!',
            reviewer: 'Reviewer 1',
          },
          {
            movieId: movie.id,
            rating: 9.0,
            comment: 'Great movie!',
            reviewer: 'Reviewer 2',
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get(`/movie-ratings/movie/${movie.id}/average`)
        .expect(200);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.averageRating).toBe(8.5);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.totalRatings).toBe(2);
    });

    it('should return appropriate response for movie with no ratings', async () => {
      const movieWithoutRatings = await prismaService.movie.create({
        data: {
          title: 'No Ratings Movie',
          description: 'A movie with no ratings',
          releaseYear: 2023,
          genre: 'Drama',
          duration: 100,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/movie-ratings/movie/${movieWithoutRatings.id}/average`)
        .expect(200);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.averageRating).toBe(0);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.totalRatings).toBe(0);
    });

    it('should return 404 for non-existent movie', async () => {
      await request(app.getHttpServer())
        .get('/movie-ratings/movie/999999/average')
        .expect(404);
    });
  });

  describe('GET /movie-ratings/movie/:movieId', () => {
    it('should get all ratings for a specific movie without token (read operation)', async () => {
      const movie = await prismaService.movie.create({
        data: {
          title: 'Test Movie',
          description: 'Test description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });

      await prismaService.movieRating.createMany({
        data: [
          {
            movieId: movie.id,
            rating: 8.0,
            comment: 'Good movie!',
            reviewer: 'Reviewer 1',
          },
          {
            movieId: movie.id,
            rating: 9.0,
            comment: 'Great movie!',
            reviewer: 'Reviewer 2',
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get(`/movie-ratings/movie/${movie.id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it('should return 404 for non-existent movie', async () => {
      await request(app.getHttpServer())
        .get('/movie-ratings/movie/999999')
        .expect(404);
    });
  });

  describe('GET /movie-ratings/:id', () => {
    it('should get a specific movie rating without token (read operation)', async () => {
      const movie = await prismaService.movie.create({
        data: {
          title: 'Test Movie',
          description: 'Test description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });

      const rating = await prismaService.movieRating.create({
        data: {
          movieId: movie.id,
          rating: 8.5,
          comment: 'Great movie!',
          reviewer: 'Test Reviewer',
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/movie-ratings/${rating.id}`)
        .expect(200);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.id).toBe(rating.id);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.rating).toBe(8.5);
    });

    it('should return 404 for non-existent rating', async () => {
      await request(app.getHttpServer())
        .get('/movie-ratings/999999')
        .expect(404);
    });

    it('should return 400 for invalid rating ID', async () => {
      await request(app.getHttpServer())
        .get('/movie-ratings/invalid-id')
        .expect(400);
    });
  });

  describe('PATCH /movie-ratings/:id', () => {
    let rating: any;

    beforeEach(async () => {
      const movie = await prismaService.movie.create({
        data: {
          title: 'Test Movie',
          description: 'Test description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });

      rating = await prismaService.movieRating.create({
        data: {
          movieId: movie.id,
          rating: 8.5,
          comment: 'Great movie!',
          reviewer: 'Test Reviewer',
        },
      });
    });

    it('should update a movie rating with valid token', async () => {
      const updateData = {
        rating: 9.0,
        comment: 'Excellent movie!',
      };

      const response = await request(app.getHttpServer())
        .patch(`/movie-ratings/${rating.id}`)
        .set('X-API-Token', API_TOKEN)
        .send(updateData)
        .expect(200);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.rating).toBe(9.0);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.comment).toBe('Excellent movie!');
    });

    it('should return 401 when no token is provided', async () => {
      const updateData = {
        rating: 9.0,
      };

      await request(app.getHttpServer())
        .patch(`/movie-ratings/${rating.id}`)
        .send(updateData)
        .expect(401);
    });

    it('should return 401 when invalid token is provided', async () => {
      const updateData = {
        rating: 9.0,
      };

      await request(app.getHttpServer())
        .patch(`/movie-ratings/${rating.id}`)
        .set('X-API-Token', 'invalid-token')
        .send(updateData)
        .expect(401);
    });

    it('should return 404 for non-existent rating', async () => {
      const updateData = {
        rating: 9.0,
      };

      await request(app.getHttpServer())
        .patch('/movie-ratings/999999')
        .set('X-API-Token', API_TOKEN)
        .send(updateData)
        .expect(404);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdateData = {
        rating: 11, // rating should be between 1-10
      };

      await request(app.getHttpServer())
        .patch(`/movie-ratings/${rating.id}`)
        .set('X-API-Token', API_TOKEN)
        .send(invalidUpdateData)
        .expect(400);
    });
  });

  describe('DELETE /movie-ratings/:id', () => {
    let rating: any;

    beforeEach(async () => {
      const movie = await prismaService.movie.create({
        data: {
          title: 'Test Movie',
          description: 'Test description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });

      rating = await prismaService.movieRating.create({
        data: {
          movieId: movie.id,
          rating: 8.5,
          comment: 'Great movie!',
          reviewer: 'Test Reviewer',
        },
      });
    });

    it('should delete a movie rating with valid token', async () => {
      await request(app.getHttpServer())
        .delete(`/movie-ratings/${rating.id}`)
        .set('X-API-Token', API_TOKEN)
        .expect(200);

      // Verify rating is deleted
      const deletedRating = await prismaService.movieRating.findUnique({
        where: { id: rating.id },
      });
      expect(deletedRating).toBeNull();
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .delete(`/movie-ratings/${rating.id}`)
        .expect(401);
    });

    it('should return 401 when invalid token is provided', async () => {
      await request(app.getHttpServer())
        .delete(`/movie-ratings/${rating.id}`)
        .set('X-API-Token', 'invalid-token')
        .expect(401);
    });

    it('should return 404 for non-existent rating', async () => {
      await request(app.getHttpServer())
        .delete('/movie-ratings/999999')
        .set('X-API-Token', API_TOKEN)
        .expect(404);
    });
  });
});
