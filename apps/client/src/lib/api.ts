const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SearchParams {
  q: string;
  sortBy?: 'title' | 'name' | 'rating' | 'releaseYear' | 'createdAt' | 'director' | 'budget' | 'boxOffice' | 'nationality';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchItem {
  id: number;
  type: 'movie' | 'actor';
  title?: string;
  name?: string;
  description?: string;
  plot?: string;
  biography?: string;
  releaseYear?: number;
  birthDate?: string;
  placeOfBirth?: string;
  nationality?: string;
  genre?: string;
  duration?: number;
  budget?: number;
  boxOffice?: number;
  awards?: string;
  writers?: string;
  director?: string;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
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

export interface SearchResponse {
  data: SearchItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function searchMoviesAndActors(params: SearchParams): Promise<SearchResponse> {
  // Validate required parameters
  if (!params.q || !params.q.trim()) {
    throw new Error('Search query is required');
  }

  const searchParams = new URLSearchParams();
  
  searchParams.append('q', params.q.trim());
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const url = `${API_BASE_URL}/search?${searchParams.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    throw new Error(`Search failed: ${response.status} ${response.statusText}`);
  }
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Invalid response format - expected JSON');
  }
  
  const result = await response.json();
  
  // Handle NestJS response format
  if (result.success && result.data) {
    return {
      data: result.data,
      meta: result.meta || {
        page: 1,
        limit: 10,
        total: result.data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
  }
  
  // If it's already in the expected format
  if (result.data && result.meta) {
    return result;
  }
  
  // Fallback for other formats
  return {
    data: Array.isArray(result) ? result : [],
    meta: {
      page: 1,
      limit: 10,
      total: Array.isArray(result) ? result.length : 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
  };
}