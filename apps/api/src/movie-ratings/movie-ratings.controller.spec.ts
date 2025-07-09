import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MovieRatingsController } from './movie-ratings.controller';
import { MovieRatingsService } from './movie-ratings.service';
import { PrismaService } from '../common/prisma.service';

describe('MovieRatingsController', () => {
  let controller: MovieRatingsController;
  let service: MovieRatingsService;

  const mockMovieRatingsService = {
    findAll: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-api-secret'),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieRatingsController],
      providers: [
        {
          provide: MovieRatingsService,
          useValue: mockMovieRatingsService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<MovieRatingsController>(MovieRatingsController);
    service = module.get<MovieRatingsService>(MovieRatingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service with undefined when no movieId is provided', async () => {
      mockMovieRatingsService.findAll.mockResolvedValue([]);

      await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should call service with parsed movieId when valid movieId is provided', async () => {
      mockMovieRatingsService.findAll.mockResolvedValue([]);

      await controller.findAll('123');

      expect(service.findAll).toHaveBeenCalledWith(123);
    });

    it('should throw BadRequestException when movieId is not a valid number', () => {
      expect(() => controller.findAll('invalid')).toThrow(BadRequestException);
      expect(() => controller.findAll('invalid')).toThrow(
        'movieId must be a valid number',
      );
    });

    it('should call service with parsed movieId when movieId is "0"', async () => {
      mockMovieRatingsService.findAll.mockResolvedValue([]);

      await controller.findAll('0');

      expect(service.findAll).toHaveBeenCalledWith(0);
    });
  });
});
