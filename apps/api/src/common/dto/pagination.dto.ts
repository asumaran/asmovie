import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PaginationDto {
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
  @Transform(
    ({ value }) =>
      value ?? parseInt(process.env.PAGINATION_DEFAULT_LIMIT ?? '10', 10),
  )
  limit?: number = 10;
}
