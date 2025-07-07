import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../common/prisma.service';
import * as dotenv from 'dotenv';

dotenv.config();

const API_TOKEN =
  process.env.API_TOKEN ??
  'your-super-secure-api-secret-key-here-at-least-32-characters-long';

describe('Actors Integration Tests', () => {
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

  describe('POST /actors', () => {
    it('should create a new actor with valid token', async () => {
      const createActorDto = {
        name: 'Test Actor',
        biography: 'Test biography',
        birthDate: '1990-01-01',
      };

      const response = await request(app.getHttpServer())
        .post('/actors')
        .set('X-API-Token', API_TOKEN)
        .send(createActorDto)
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.name).toBe('Test Actor');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.biography).toBe('Test biography');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.id).toBeDefined();
    });

    it('should return 401 when no token is provided', async () => {
      const createActorDto = {
        name: 'Test Actor',
        biography: 'Test biography',
        birthDate: '1990-01-01',
      };

      await request(app.getHttpServer())
        .post('/actors')
        .send(createActorDto)
        .expect(401);
    });

    it('should return 401 when invalid token is provided', async () => {
      const createActorDto = {
        name: 'Test Actor',
        biography: 'Test biography',
        birthDate: '1990-01-01',
      };

      await request(app.getHttpServer())
        .post('/actors')
        .set('X-API-Token', 'invalid-token')
        .send(createActorDto)
        .expect(401);
    });

    it('should return 400 for invalid actor data', async () => {
      const invalidActorDto = {
        name: '', // empty name should fail validation
        biography: 'Test biography',
      };

      await request(app.getHttpServer())
        .post('/actors')
        .set('X-API-Token', API_TOKEN)
        .send(invalidActorDto)
        .expect(400);
    });
  });

  describe('GET /actors', () => {
    beforeEach(async () => {
      // Create test data
      await prismaService.actor.create({
        data: {
          name: 'Test Actor 1',
          biography: 'Test biography',
          birthDate: new Date('1990-01-01'),
        },
      });
    });

    it('should get all actors without token (read operation)', async () => {
      const response = await request(app.getHttpServer())
        .get('/actors')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data[0].name).toBe('Test Actor 1');
    });

    it('should search actors by name', async () => {
      // Create another actor for search test
      await prismaService.actor.create({
        data: {
          name: 'John Doe',
          biography: 'Another actor',
          birthDate: new Date('1985-01-01'),
        },
      });

      const response = await request(app.getHttpServer())
        .get('/actors?search=John%20Doe')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data[0].name).toBe('John Doe');
    });
  });

  describe('GET /actors/:id', () => {
    let actor: any;

    beforeEach(async () => {
      actor = await prismaService.actor.create({
        data: {
          name: 'Test Actor',
          biography: 'Test biography',
          birthDate: new Date('1990-01-01'),
        },
      });
    });

    it('should get a specific actor without token (read operation)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/actors/${actor.id}`)
        .expect(200);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.id).toBe(actor.id);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.name).toBe('Test Actor');
    });

    it('should return 404 for non-existent actor', async () => {
      await request(app.getHttpServer()).get('/actors/999999').expect(404);
    });

    it('should return 400 for invalid actor ID', async () => {
      await request(app.getHttpServer()).get('/actors/invalid-id').expect(400);
    });
  });

  describe('PATCH /actors/:id', () => {
    let actor: any;

    beforeEach(async () => {
      actor = await prismaService.actor.create({
        data: {
          name: 'Test Actor',
          biography: 'Test biography',
          birthDate: new Date('1990-01-01'),
        },
      });
    });

    it('should update an actor with valid token', async () => {
      const updateData = {
        name: 'Updated Actor',
        biography: 'Updated biography',
      };

      const response = await request(app.getHttpServer())
        .patch(`/actors/${actor.id}`)
        .set('X-API-Token', API_TOKEN)
        .send(updateData)
        .expect(200);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.name).toBe('Updated Actor');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.biography).toBe('Updated biography');
    });

    it('should return 401 when no token is provided', async () => {
      const updateData = {
        name: 'Updated Actor',
      };

      await request(app.getHttpServer())
        .patch(`/actors/${actor.id}`)
        .send(updateData)
        .expect(401);
    });

    it('should return 401 when invalid token is provided', async () => {
      const updateData = {
        name: 'Updated Actor',
      };

      await request(app.getHttpServer())
        .patch(`/actors/${actor.id}`)
        .set('X-API-Token', 'invalid-token')
        .send(updateData)
        .expect(401);
    });

    it('should return 404 for non-existent actor', async () => {
      const updateData = {
        name: 'Updated Actor',
      };

      await request(app.getHttpServer())
        .patch('/actors/999999')
        .set('X-API-Token', API_TOKEN)
        .send(updateData)
        .expect(404);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdateData = {
        name: '', // empty name should fail validation
      };

      await request(app.getHttpServer())
        .patch(`/actors/${actor.id}`)
        .set('X-API-Token', API_TOKEN)
        .send(invalidUpdateData)
        .expect(400);
    });
  });

  describe('DELETE /actors/:id', () => {
    let actor: any;

    beforeEach(async () => {
      actor = await prismaService.actor.create({
        data: {
          name: 'Test Actor',
          biography: 'Test biography',
          birthDate: new Date('1990-01-01'),
        },
      });
    });

    it('should delete an actor with valid token', async () => {
      await request(app.getHttpServer())
        .delete(`/actors/${actor.id}`)
        .set('X-API-Token', API_TOKEN)
        .expect(200);

      // Verify actor is deleted
      const deletedActor = await prismaService.actor.findUnique({
        where: { id: actor.id },
      });
      expect(deletedActor).toBeNull();
    });

    it('should return 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .delete(`/actors/${actor.id}`)
        .expect(401);
    });

    it('should return 401 when invalid token is provided', async () => {
      await request(app.getHttpServer())
        .delete(`/actors/${actor.id}`)
        .set('X-API-Token', 'invalid-token')
        .expect(401);
    });

    it('should return 404 for non-existent actor', async () => {
      await request(app.getHttpServer())
        .delete('/actors/999999')
        .set('X-API-Token', API_TOKEN)
        .expect(404);
    });
  });

  describe('GET /actors/:id/movies', () => {
    let actor: any;
    let movie: any;

    beforeEach(async () => {
      // Create test actor
      actor = await prismaService.actor.create({
        data: {
          name: 'Test Actor',
          biography: 'Test biography',
          birthDate: new Date('1990-01-01'),
        },
      });

      // Create test movie
      movie = await prismaService.movie.create({
        data: {
          title: 'Test Movie',
          description: 'Test description',
          releaseYear: 2023,
          genre: 'Action',
          duration: 120,
        },
      });

      // Link actor to movie
      await prismaService.movieActor.create({
        data: {
          movieId: movie.id,
          actorId: actor.id,
          role: 'Lead Actor',
        },
      });
    });

    it('should get movies for an actor without token (read operation)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/actors/${actor.id}/movies`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data[0].title).toBe('Test Movie');
    });

    it('should return 404 for non-existent actor', async () => {
      await request(app.getHttpServer())
        .get('/actors/999999/movies')
        .expect(404);
    });
  });
});
