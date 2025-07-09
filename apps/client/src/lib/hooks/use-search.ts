import { useQuery } from '@tanstack/react-query';
import { SearchParams, searchMoviesAndActors } from '../api';
import { useEffect, useState } from 'react';

export function useSearch(params: SearchParams) {
  const [debouncedParams, setDebouncedParams] = useState(params);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedParams(params);
    }, 300);

    return () => clearTimeout(timer);
  }, [params.q, params.page, params.limit, params.sortBy, params.sortOrder]);

  return useQuery({
    queryKey: ['search', debouncedParams],
    queryFn: async () => {
      try {
        return await searchMoviesAndActors(debouncedParams);
      } catch (error) {
        console.error('Search error:', error);
        throw error;
      }
    },
    enabled: !!debouncedParams.q?.trim(),
    staleTime: 30 * 1000, // 30 seconds
    // Keep previous data while fetching new data to avoid loading flicker
    placeholderData: (previousData) => previousData,
    // Don't show loading state when we have previous data
    refetchOnMount: false,
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (
        error.message.includes('Search query is required') ||
        error.message.includes('Invalid response format')
      ) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
