import { Type } from 'class-transformer';

export class SearchItemDto {
  id: number;
  type: 'movie' | 'actor';
  title?: string;
  name?: string;
  description?: string;
  biography?: string;
  releaseYear?: number;
  birthDate?: Date;
  genre?: string;
  duration?: number;
  averageRating?: number;
  createdAt: Date;
  updatedAt: Date;
  actors?: {
    id: number;
    name: string;
    role: string;
  }[];
  movies?: {
    id: number;
    title: string;
    role: string;
  }[];
}

export class SearchResponseDto {
  @Type(() => SearchItemDto)
  data: SearchItemDto[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}