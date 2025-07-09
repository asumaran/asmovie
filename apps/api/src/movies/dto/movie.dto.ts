import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class MovieActorDto {
  @IsInt()
  @Type(() => Number)
  actorId: number;

  @IsString()
  role: string;
}

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  plot?: string;

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

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budget?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  boxOffice?: number;

  @IsOptional()
  @IsString()
  awards?: string;

  @IsOptional()
  @IsString()
  writers?: string;

  @IsOptional()
  @IsString()
  director?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovieActorDto)
  actors?: MovieActorDto[];
}

export class UpdateMovieDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  plot?: string;

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

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budget?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  boxOffice?: number;

  @IsOptional()
  @IsString()
  awards?: string;

  @IsOptional()
  @IsString()
  writers?: string;

  @IsOptional()
  @IsString()
  director?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovieActorDto)
  actors?: MovieActorDto[];
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
  @IsIn([
    'title',
    'releaseYear',
    'createdAt',
    'genre',
    'director',
    'budget',
    'boxOffice',
  ])
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
  @IsIn([
    'title',
    'releaseYear',
    'createdAt',
    'genre',
    'director',
    'budget',
    'boxOffice',
  ])
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
