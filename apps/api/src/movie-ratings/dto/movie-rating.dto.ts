import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMovieRatingDto {
  @IsInt()
  @Type(() => Number)
  movieId: number;

  @IsNumber()
  @Min(1.0)
  @Max(10.0)
  @Type(() => Number)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsString()
  reviewer: string;
}

export class UpdateMovieRatingDto {
  @IsOptional()
  @IsNumber()
  @Min(1.0)
  @Max(10.0)
  @Type(() => Number)
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  reviewer?: string;
}
