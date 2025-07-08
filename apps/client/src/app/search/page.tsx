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
import { searchMoviesAndActors } from '@/lib/data';
import {
  getCurrentPage,
  getItemsPerPage,
  paginateArray,
} from '@/lib/pagination';
import {
  getSortValue,
  SEARCH_SORT_OPTIONS,
  sortSearchResults,
} from '@/lib/sorting';
import { Film, Search, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const currentPage = getCurrentPage(searchParams);
  const itemsPerPage = getItemsPerPage(searchParams);
  const sortBy = getSortValue(searchParams, SEARCH_SORT_OPTIONS[0].value);

  const { movies, actors } = searchMoviesAndActors(query);
  const allResults = [
    ...movies.map((movie) => ({ ...movie, type: 'movie' as const })),
    ...actors.map((actor) => ({ ...actor, type: 'actor' as const })),
  ];

  // Sort results first, then paginate
  const sortedResults = sortSearchResults(allResults, sortBy);
  const { items: paginatedResults, totalPages } = paginateArray(
    sortedResults,
    currentPage,
    itemsPerPage,
  );

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
    <div className="space-y-8">
      {/* Search Summary */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-muted-foreground">
          Found {allResults.length} result{allResults.length !== 1 ? 's' : ''}{' '}
          for "{query}"
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
          {Math.min(currentPage * itemsPerPage, allResults.length)} of{' '}
          {allResults.length} results
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
          itemsPerPage === 6
            ? 'md:grid-cols-2 lg:grid-cols-3'
            : itemsPerPage === 12
              ? 'md:grid-cols-3 lg:grid-cols-4'
              : 'md:grid-cols-4 lg:grid-cols-6'
        }`}
      >
        {paginatedResults.map((result, index) => {
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
                          className={`${itemsPerPage === 24 ? 'text-lg' : 'text-xl'}`}
                        >
                          {movie.title}
                        </CardTitle>
                        <CardDescription>
                          {movie.year} • {movie.director}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{movie.rating}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Badge variant="outline">{movie.genre}</Badge>
                      <p
                        className={`text-sm text-muted-foreground ${itemsPerPage === 24 ? 'line-clamp-2' : ''}`}
                      >
                        {movie.description}
                      </p>
                      {itemsPerPage !== 24 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Cast:</h4>
                          <div className="flex flex-wrap gap-1">
                            {movie.cast &&
                              movie.cast
                                .slice(0, 3)
                                .map((actor, actorIndex) => (
                                  <Badge
                                    key={actorIndex}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {typeof actor === 'string'
                                      ? actor
                                      : actor.name}
                                  </Badge>
                                ))}
                            {movie.cast && movie.cast.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{movie.cast.length - 3} more
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
                          className={`${itemsPerPage === 24 ? 'text-lg' : 'text-xl'}`}
                        >
                          {actor.name}
                        </CardTitle>
                        <CardDescription>
                          {actor.nationality} • {actor.age} years old
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Known for:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {actor.knownFor &&
                            actor.knownFor
                              .slice(0, itemsPerPage === 24 ? 2 : 3)
                              .map((movie, movieIndex) => (
                                <Badge
                                  key={movieIndex}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {movie}
                                </Badge>
                              ))}
                          {actor.knownFor &&
                            actor.knownFor.length >
                              (itemsPerPage === 24 ? 2 : 3) && (
                              <Badge variant="outline" className="text-xs">
                                +
                                {actor.knownFor.length -
                                  (itemsPerPage === 24 ? 2 : 3)}{' '}
                                more
                              </Badge>
                            )}
                        </div>
                      </div>
                      <p
                        className={`text-sm text-muted-foreground ${itemsPerPage === 24 ? 'line-clamp-2' : ''}`}
                      >
                        {actor.bio}
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
      <Suspense
        fallback={
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Searching...</p>
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </div>
  );
}
