'use client';

import { ItemsPerPageSelector } from '@/components/items-per-page-selector';
import { Pagination } from '@/components/pagination';
import { SortSelector } from '@/components/sort-selector';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { searchMoviesAndActors } from '@/lib/api';
import { getCurrentPage, getItemsPerPage } from '@/lib/pagination';
import { getSortValue, SEARCH_SORT_OPTIONS } from '@/lib/sorting';
import { Film, Loader2, Search, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

function SearchLoadingSkeleton({ query, itemsPerPage }) {
  return (
    <div className="space-y-8">
      {/* Loading message */}
      <div className="text-center py-8">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Searching...</h2>
        <p className="text-muted-foreground">
          Finding movies and actors for "{query}"
        </p>
      </div>

      {/* Controls skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
              ? 'md:grid-cols-2 lg:grid-cols-3'
              : itemsPerPage === 15
                ? 'md:grid-cols-3 lg:grid-cols-4'
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

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const currentPage = getCurrentPage(searchParams);
  const itemsPerPage = getItemsPerPage(searchParams);
  const sortBy = getSortValue(searchParams, SEARCH_SORT_OPTIONS[0].value);

  const [searchResponse, setSearchResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setSearchResponse({
          data: [],
          meta: {
            page: 1,
            limit: itemsPerPage,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await searchMoviesAndActors({
          q: query,
          page: currentPage,
          limit: itemsPerPage,
          sortBy: sortBy as
            | 'title'
            | 'name'
            | 'rating'
            | 'releaseYear'
            | 'createdAt'
            | 'director'
            | 'budget'
            | 'boxOffice'
            | 'nationality',
          sortOrder: 'desc',
        });
        setSearchResponse(response);
      } catch (err) {
        setError(err.message || 'An error occurred while searching');
        setSearchResponse({
          data: [],
          meta: {
            page: 1,
            limit: itemsPerPage,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        });
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [query, currentPage, itemsPerPage, sortBy]);

  const allResults = searchResponse?.data || [];
  const totalPages = searchResponse?.meta?.totalPages || 1;
  const total = searchResponse?.meta?.total || 0;

  // Separate movies and actors for display stats - memoized to prevent infinite loops
  const { movies, actors } = useMemo(() => {
    const movies = allResults.filter((item) => item.type === 'movie');
    const actors = allResults.filter((item) => item.type === 'actor');
    return { movies, actors };
  }, [allResults]);

  if (!query.trim()) {
    return (
      <div className="text-center py-16">
        <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">
          No search query provided
        </h2>
        <p className="text-muted-foreground">
          Please enter a search term to find movies and actors.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <SearchLoadingSkeleton query={query} itemsPerPage={itemsPerPage} />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Search Error</h2>
        <p className="text-muted-foreground">
          Failed to search for "{query}". Please try again.
        </p>
      </div>
    );
  }

  if (allResults.length === 0) {
    return (
      <div className="text-center py-16">
        <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No results found</h2>
        <p className="text-muted-foreground">
          No movies or actors found for "{query}". Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 search-results-container">
      {/* Search Summary */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-muted-foreground">
          Found {total} result{total !== 1 ? 's' : ''} for "{query}"
        </p>
        <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Film className="h-4 w-4" />
            {movies.length} movies
          </span>
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {actors.length} actors
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, total)} of {total} results
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <SortSelector
            options={SEARCH_SORT_OPTIONS}
            currentValue={sortBy}
            baseUrl="/search"
          />
          <ItemsPerPageSelector currentValue={itemsPerPage} baseUrl="/search" />
        </div>
      </div>

      {/* Results Grid */}
      <div
        className={`grid gap-6 ${
          itemsPerPage === 5
            ? 'md:grid-cols-2 lg:grid-cols-3'
            : itemsPerPage === 10
              ? 'md:grid-cols-2 lg:grid-cols-3'
              : itemsPerPage === 15
                ? 'md:grid-cols-3 lg:grid-cols-4'
                : 'md:grid-cols-4 lg:grid-cols-5'
        }`}
      >
        {allResults.map((result, index) => {
          if (result.type === 'movie') {
            const movie = result;
            return (
              <Link key={`movie-${movie.id}`} href={`/movies/${movie.id}`}>
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
                        <CardTitle
                          className={`${itemsPerPage === 20 ? 'text-lg' : 'text-xl'}`}
                        >
                          {movie.title}
                        </CardTitle>
                        <CardDescription>
                          {movie.releaseYear} • {movie.director}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {movie.averageRating?.toFixed(1) || 'N/A'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Badge variant="outline">{movie.genre}</Badge>
                      <p
                        className={`text-sm text-muted-foreground ${itemsPerPage === 20 ? 'line-clamp-2' : ''}`}
                      >
                        {movie.description || movie.plot}
                      </p>
                      {itemsPerPage !== 20 && movie.actors && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Cast:</h4>
                          <div className="flex flex-wrap gap-1">
                            {movie.actors
                              .slice(0, 3)
                              .map((actor, actorIndex) => (
                                <Badge
                                  key={actorIndex}
                                  variant="outline"
                                  className="text-xs"
                                >
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
            );
          } else {
            const actor = result;
            return (
              <Link key={`actor-${actor.id}`} href={`/actors/${actor.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">
                            Actor
                          </Badge>
                        </div>
                        <CardTitle
                          className={`${itemsPerPage === 20 ? 'text-lg' : 'text-xl'}`}
                        >
                          {actor.name}
                        </CardTitle>
                        <CardDescription>
                          {actor.nationality} • {actor.placeOfBirth}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {actor.movies && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">
                            Known for:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {actor.movies
                              .slice(0, itemsPerPage === 20 ? 2 : 3)
                              .map((movie, movieIndex) => (
                                <Badge
                                  key={movieIndex}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {movie.title}
                                </Badge>
                              ))}
                            {actor.movies.length >
                              (itemsPerPage === 20 ? 2 : 3) && (
                              <Badge variant="outline" className="text-xs">
                                +
                                {actor.movies.length -
                                  (itemsPerPage === 20 ? 2 : 3)}{' '}
                                more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      <p
                        className={`text-sm text-muted-foreground ${itemsPerPage === 20 ? 'line-clamp-2' : ''}`}
                      >
                        {actor.biography}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          }
        })}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/search"
        searchParams={searchParams}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="container mx-auto py-8">
      <SearchResults />
    </div>
  );
}
