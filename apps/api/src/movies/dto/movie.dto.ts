import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsIn,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 5)
  @Type(() => Number)
  releaseYear: number;

  @IsString()
  genre: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  duration: number; // in minutes
}

export class UpdateMovieDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 5)
  @Type(() => Number)
  releaseYear?: number;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  duration?: number;
}

export class AddActorToMovieDto {
  @IsInt()
  @Type(() => Number)
  actorId: number;

  @IsString()
  role: string;
}

export class MovieFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  releaseYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  @Type(() => Number)
  minRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  @Type(() => Number)
  maxRating?: number;

  @IsOptional()
  @IsString()
  @IsIn(['title', 'releaseYear', 'createdAt', 'genre'])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class MovieQueryDto {
  // Filter parameters
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  releaseYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  @Type(() => Number)
  minRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  @Type(() => Number)
  maxRating?: number;

  @IsOptional()
  @IsString()
  @IsIn(['title', 'releaseYear', 'createdAt', 'genre'])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  // Pagination parameters
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}
