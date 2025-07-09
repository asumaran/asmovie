'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/pagination';
import { ItemsPerPageSelector } from '@/components/items-per-page-selector';
import { SortSelector } from '@/components/sort-selector';
import { getPaginatedMovies } from '@/lib/api';
import { getCurrentPage, getItemsPerPage } from '@/lib/pagination';
import { getSortValue, MOVIE_SORT_OPTIONS } from '@/lib/sorting';
import { Loader2, Film } from 'lucide-react';

interface PaginatedMoviesResult {
  items: any[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  itemsPerPage: number;
}

function MoviesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [moviesData, setMoviesData] = useState<PaginatedMoviesResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = getCurrentPage(searchParams);
  const itemsPerPage = getItemsPerPage(searchParams);
  const sortBy = getSortValue(searchParams, MOVIE_SORT_OPTIONS[0].value);

  useEffect(() => {
    async function fetchMovies() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getPaginatedMovies(currentPage, itemsPerPage, sortBy);
        setMoviesData(result);
      } catch (err) {
        setError('Failed to load movies. Please try again.');
        console.error('Error fetching movies:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovies();
  }, [currentPage, itemsPerPage, sortBy]);

  if (error) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-2">Error Loading Movies</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <MoviesLoadingSkeleton itemsPerPage={itemsPerPage} />;
  }

  if (!moviesData) {
    return null;
  }

  const { items: paginatedMovies, totalPages, totalItems } = moviesData;

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of{' '}
          {totalItems} movies
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <SortSelector options={MOVIE_SORT_OPTIONS} currentValue={sortBy} baseUrl="/movies" />
          <ItemsPerPageSelector currentValue={itemsPerPage} baseUrl="/movies" />
        </div>
      </div>

      {/* Movies Grid */}
      <div
        className={`grid gap-6 ${
          itemsPerPage === 5
            ? 'md:grid-cols-2 lg:grid-cols-3'
            : itemsPerPage === 10
              ? 'md:grid-cols-3 lg:grid-cols-4'
              : itemsPerPage === 15
                ? 'md:grid-cols-3 lg:grid-cols-5'
                : 'md:grid-cols-4 lg:grid-cols-5'
        }`}
      >
        {paginatedMovies.map((movie) => (
          <Link key={movie.id} href={`/movies/${movie.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Film className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">
                        Movie
                      </Badge>
                    </div>
                    <CardTitle className={`${itemsPerPage === 20 ? 'text-lg' : 'text-xl'}`}>
                      {movie.title}
                    </CardTitle>
                    <CardDescription>
                      {movie.releaseYear} • {movie.director}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{movie.averageRating?.toFixed(1) || 'N/A'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="outline">{movie.genre}</Badge>
                  <p className={`text-sm text-muted-foreground ${itemsPerPage === 20 ? 'line-clamp-2' : ''}`}>
                    {movie.description || movie.plot}
                  </p>
                  {itemsPerPage !== 20 && movie.actors && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Cast:</h4>
                      <div className="flex flex-wrap gap-1">
                        {movie.actors.slice(0, 3).map((actor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {actor.name}
                          </Badge>
                        ))}
                        {movie.actors.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{movie.actors.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/movies" searchParams={searchParams} />
    </>
  );
}

function MoviesLoadingSkeleton({ itemsPerPage }: { itemsPerPage: number }) {
  return (
    <div>
      {/* Loading message */}
      <div className="text-center py-8 mb-6">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold mb-2">Loading Movies...</h2>
        <p className="text-muted-foreground">Please wait while we fetch the latest movies</p>
      </div>

      {/* Controls skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-8 bg-muted rounded w-40 animate-pulse"></div>
          <div className="h-8 bg-muted rounded w-32 animate-pulse"></div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div
        className={`grid gap-6 ${
          itemsPerPage === 5
            ? 'md:grid-cols-2 lg:grid-cols-3'
            : itemsPerPage === 10
              ? 'md:grid-cols-3 lg:grid-cols-4'
              : itemsPerPage === 15
                ? 'md:grid-cols-3 lg:grid-cols-5'
                : 'md:grid-cols-4 lg:grid-cols-5'
        }`}
      >
        {Array.from({ length: itemsPerPage }).map((_, i) => (
          <Card key={i} className="h-64 animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-center space-x-2 mt-8">
        <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
        <div className="h-8 bg-muted rounded w-8 animate-pulse"></div>
        <div className="h-8 bg-muted rounded w-8 animate-pulse"></div>
        <div className="h-8 bg-muted rounded w-8 animate-pulse"></div>
        <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
      </div>
    </div>
  );
}

export default function MoviesPage() {
  const searchParams = useSearchParams();
  const itemsPerPage = getItemsPerPage(searchParams);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Movies</h1>
        <p className="text-muted-foreground">Discover amazing movies and their details</p>
      </div>

      <Suspense fallback={<MoviesLoadingSkeleton itemsPerPage={itemsPerPage} />}>
        <MoviesContent />
      </Suspense>
    </div>
  );
}