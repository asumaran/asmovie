'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/pagination';
import { ItemsPerPageSelector } from '@/components/items-per-page-selector';
import { SortSelector } from '@/components/sort-selector';
import { getPaginatedActors } from '@/lib/api';
import { getCurrentPage, getItemsPerPage } from '@/lib/pagination';
import { getSortValue, ACTOR_SORT_OPTIONS } from '@/lib/sorting';
import { Loader2, User } from 'lucide-react';

interface PaginatedActorsResult {
  items: any[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  itemsPerPage: number;
}

function ActorsContent() {
  const searchParams = useSearchParams();
  const [actorsData, setActorsData] = useState<PaginatedActorsResult | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = getCurrentPage(searchParams);
  const itemsPerPage = getItemsPerPage(searchParams);
  const sortBy = getSortValue(searchParams, 'createdAt');

  useEffect(() => {
    async function fetchActors() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getPaginatedActors(
          currentPage,
          itemsPerPage,
          sortBy,
        );
        setActorsData(result);
      } catch (err) {
        setError('Failed to load actors. Please try again.');
        console.error('Error fetching actors:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchActors();
  }, [currentPage, itemsPerPage, sortBy]);

  if (error) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-2">Error Loading Actors</h2>
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
    return <ActorsLoadingSkeleton itemsPerPage={itemsPerPage} />;
  }

  if (!actorsData) {
    return null;
  }

  const { items: paginatedActors, totalPages, totalItems } = actorsData;

  // Calculate age from birthDate
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{' '}
          actors
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <SortSelector
            options={ACTOR_SORT_OPTIONS}
            currentValue={sortBy}
            baseUrl="/actors"
          />
          <ItemsPerPageSelector currentValue={itemsPerPage} baseUrl="/actors" />
        </div>
      </div>

      {/* Actors Grid */}
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
        {paginatedActors.map((actor) => {
          const age = calculateAge(actor.birthDate);
          return (
            <Link key={actor.id} href={`/actors/${actor.id}`}>
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
                        {actor.nationality}
                        {age && ` • ${age} years old`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {actor.placeOfBirth && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">
                          Place of Birth:
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {actor.placeOfBirth}
                        </p>
                      </div>
                    )}
                    {actor.movies && actor.movies.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Known for:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {actor.movies
                            .slice(0, itemsPerPage === 20 ? 2 : 3)
                            .map((movie, index) => (
                              <Badge
                                key={index}
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
                      className={`text-sm text-muted-foreground ${
                        itemsPerPage === 20 ? 'line-clamp-2' : 'line-clamp-3'
                      }`}
                    >
                      {actor.biography}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/actors"
        searchParams={searchParams}
      />
    </>
  );
}

function ActorsLoadingSkeleton({ itemsPerPage }: { itemsPerPage: number }) {
  return (
    <div>
      {/* Loading message */}
      <div className="text-center py-8 mb-6">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold mb-2">Loading Actors...</h2>
        <p className="text-muted-foreground">
          Please wait while we fetch the latest actors
        </p>
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

export default function ActorsPage() {
  const searchParams = useSearchParams();
  const itemsPerPage = getItemsPerPage(searchParams);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Actors</h1>
        <p className="text-muted-foreground">
          Meet talented actors from around the world
        </p>
      </div>

      <Suspense
        fallback={<ActorsLoadingSkeleton itemsPerPage={itemsPerPage} />}
      >
        <ActorsContent />
      </Suspense>
    </div>
  );
}
