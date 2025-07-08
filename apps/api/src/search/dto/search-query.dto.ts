import {
  IsString,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  q: string;

  @IsOptional()
  @IsString()
  @IsIn([
    'title',
    'name',
    'rating',
    'releaseYear',
    'createdAt',
    'director',
    'budget',
    'boxOffice',
    'nationality',
  ])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(20)
  @IsIn([5, 10, 15, 20])
  @Type(() => Number)
  limit?: number = 10;
}
