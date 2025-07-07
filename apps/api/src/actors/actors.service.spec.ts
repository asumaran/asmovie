import { Test, TestingModule } from '@nestjs/testing';
import { ActorsService } from './actors.service';
import { PrismaService } from '../common/prisma.service';
import { QueryBuilderService } from '../common/services/query-builder.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

describe('ActorsService', () => {
  let service: ActorsService;

  const mockPrismaService = {
    actor: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    movieActor: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: QueryBuilderService,
          useValue: {
            buildPaginatedQuery: jest
              .fn()
              .mockImplementation(({ page, limit, include, where }) => ({
                skip: (page - 1) * limit,
                take: limit,
                include,
                where,
                orderBy: { createdAt: 'desc' },
              })),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key, def) => def ?? 10),
          },
        },
      ],
    }).compile();

    service = module.get<ActorsService>(ActorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an actor', async () => {
      const createActorDto = {
        name: 'Test Actor',
        biography: 'Test Bio',
        birthDate: '1990-01-01',
      };

      const expectedActor = {
        id: 1,
        ...createActorDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        movies: [],
      };

      mockPrismaService.actor.create.mockResolvedValue(expectedActor);

      const result = await service.create(createActorDto);

      expect(mockPrismaService.actor.create).toHaveBeenCalledWith({
        data: {
          ...createActorDto,
          birthDate: new Date(createActorDto.birthDate),
        },
        include: {
          movies: {
            include: {
              movie: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedActor);
    });
  });

  describe('findAll', () => {
    it('should return paginated actors', async () => {
      const expectedActors = [
        {
          id: 1,
          name: 'Actor 1',
          movies: [],
        },
      ];
      mockPrismaService.actor.findMany.mockResolvedValue(expectedActors);
      mockPrismaService.actor.count.mockResolvedValue(1);

      // page=1, limit=10 por defecto
      const result = await service.findAll(undefined, 1, 10);

      expect(mockPrismaService.actor.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          movies: {
            include: {
              movie: true,
            },
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaService.actor.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          hasNext: false,
          hasPrev: false,
          totalPages: 1,
        },
        data: expectedActors,
      });
    });

    it('should return paginated actors filtered by search term', async () => {
      const searchTerm = 'leonardo';
      const expectedActors = [
        {
          id: 1,
          name: 'Leonardo DiCaprio',
          movies: [],
        },
      ];
      mockPrismaService.actor.findMany.mockResolvedValue(expectedActors);
      mockPrismaService.actor.count.mockResolvedValue(1);

      const result = await service.findAll(searchTerm, 1, 10);

      expect(mockPrismaService.actor.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        include: {
          movies: {
            include: {
              movie: true,
            },
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaService.actor.count).toHaveBeenCalledWith({
        where: {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      });
      expect(result).toEqual({
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          hasNext: false,
          hasPrev: false,
          totalPages: 1,
        },
        data: expectedActors,
      });
    });
  });

  describe('findOne', () => {
    it('should return an actor by id', async () => {
      const actorId = 1;
      const expectedActor = {
        id: actorId,
        name: 'Test Actor',
        movies: [],
      };

      mockPrismaService.actor.findUnique.mockResolvedValue(expectedActor);

      const result = await service.findOne(actorId);

      expect(mockPrismaService.actor.findUnique).toHaveBeenCalledWith({
        where: { id: actorId },
        include: {
          movies: {
            include: {
              movie: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedActor);
    });

    it('should throw NotFoundException if actor not found', async () => {
      const actorId = 999;

      mockPrismaService.actor.findUnique.mockResolvedValue(null);

      await expect(service.findOne(actorId)).rejects.toThrow(
        new NotFoundException(`Actor with ID ${actorId} not found`),
      );
    });
  });

  describe('update', () => {
    it('should update an actor', async () => {
      const actorId = 1;
      const updateActorDto = {
        name: 'Updated Actor',
        biography: 'Updated Bio',
      };

      const existingActor = {
        id: actorId,
        name: 'Original Actor',
        biography: 'Original Bio',
        birthDate: '1990-01-01',
        movies: [],
      };

      const updatedActor = {
        ...existingActor,
        ...updateActorDto,
      };

      mockPrismaService.actor.findUnique.mockResolvedValue(existingActor);
      mockPrismaService.actor.update.mockResolvedValue(updatedActor);

      const result = await service.update(actorId, updateActorDto);

      expect(mockPrismaService.actor.update).toHaveBeenCalledWith({
        where: { id: actorId },
        data: updateActorDto,
        include: {
          movies: {
            include: {
              movie: true,
            },
          },
        },
      });
      expect(result).toEqual(updatedActor);
    });

    it('should throw NotFoundException if actor not found', async () => {
      const actorId = 999;
      const updateActorDto = { name: 'Updated Actor' };

      mockPrismaService.actor.findUnique.mockResolvedValue(null);

      await expect(service.update(actorId, updateActorDto)).rejects.toThrow(
        new NotFoundException(`Actor with ID ${actorId} not found`),
      );
    });
  });

  describe('remove', () => {
    it('should remove an actor', async () => {
      const actorId = 1;
      const mockActor = {
        id: actorId,
        name: 'Test Actor',
        movies: [],
      };

      mockPrismaService.actor.findUnique.mockResolvedValue(mockActor);
      mockPrismaService.actor.delete.mockResolvedValue(mockActor);

      const result = await service.remove(actorId);

      expect(mockPrismaService.actor.delete).toHaveBeenCalledWith({
        where: { id: actorId },
      });
      expect(result).toEqual(mockActor);
    });

    it('should throw NotFoundException if actor not found', async () => {
      const actorId = 999;

      mockPrismaService.actor.findUnique.mockResolvedValue(null);

      await expect(service.remove(actorId)).rejects.toThrow(
        new NotFoundException(`Actor with ID ${actorId} not found`),
      );
    });
  });

  describe('getMovies', () => {
    it('should return movies for an actor', async () => {
      const actorId = 1;
      const mockActor = { id: actorId, name: 'Test Actor' };
      const mockMovieActors = [
        {
          id: 1,
          movieId: 1,
          actorId,
          role: 'Lead Actor',
          movie: {
            id: 1,
            title: 'Test Movie',
            description: 'Test Description',
          },
        },
      ];
      const expectedMovies = [
        {
          id: 1,
          title: 'Test Movie',
          description: 'Test Description',
        },
      ];

      mockPrismaService.actor.findUnique.mockResolvedValue(mockActor);
      mockPrismaService.movieActor.findMany.mockResolvedValue(mockMovieActors);

      const result = await service.getMovies(actorId);

      expect(mockPrismaService.movieActor.findMany).toHaveBeenCalledWith({
        where: { actorId },
        include: {
          movie: {
            include: {
              ratings: true,
            },
          },
        },
      });
      expect(result).toEqual(expectedMovies);
    });

    it('should throw NotFoundException if actor not found', async () => {
      const actorId = 999;

      mockPrismaService.actor.findUnique.mockResolvedValue(null);

      await expect(service.getMovies(actorId)).rejects.toThrow(
        new NotFoundException(`Actor with ID ${actorId} not found`),
      );
    });
  });
});
