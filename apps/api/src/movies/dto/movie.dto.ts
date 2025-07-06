import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
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
