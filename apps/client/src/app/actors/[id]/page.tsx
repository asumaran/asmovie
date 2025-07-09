'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getActorById } from '@/lib/api';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Trophy,
  Film,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ActorPageProps {
  params: {
    id: string;
  };
}

function ActorLoadingSkeleton() {
  return (
    <div className="container mx-auto py-8">
      {/* Back Button Skeleton */}
      <div className="h-10 bg-muted rounded w-32 animate-pulse mb-6"></div>

      {/* Actor Header Skeleton */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="h-12 bg-muted rounded w-96 animate-pulse mb-2"></div>
            <div className="flex items-center gap-4">
              <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
              <div className="h-6 bg-muted rounded w-20 animate-pulse"></div>
            </div>
          </div>
          <div className="text-right">
            <div className="h-8 bg-muted rounded w-12 animate-pulse mb-1"></div>
            <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
          </div>
        </div>
        <div className="h-6 bg-muted rounded w-full animate-pulse"></div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ActorPage({ params }: ActorPageProps) {
  const [actor, setActor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchActor() {
      try {
        const actorId = Number.parseInt(params.id);
        if (isNaN(actorId)) {
          notFound();
          return;
        }

        setIsLoading(true);
        const actorData = await getActorById(actorId);

        if (!actorData) {
          notFound();
          return;
        }

        setActor(actorData);
      } catch (err) {
        setError(err.message || 'Failed to load actor');
      } finally {
        setIsLoading(false);
      }
    }

    fetchActor();
  }, [params.id]);

  if (isLoading) {
    return <ActorLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">Error Loading Actor</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!actor) {
    notFound();
  }

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

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const age = calculateAge(actor.birthDate);

  return (
    <div className="container mx-auto py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/actors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Actors
        </Link>
      </Button>

      {/* Actor Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{actor.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              {actor.birthDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(actor.birthDate)}</span>
                </div>
              )}
              {actor.placeOfBirth && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{actor.placeOfBirth}</span>
                </div>
              )}
              {actor.nationality && (
                <Badge variant="outline">{actor.nationality}</Badge>
              )}
            </div>
          </div>
          {age && (
            <div className="text-right">
              <p className="text-2xl font-bold">{age}</p>
              <p className="text-muted-foreground">years old</p>
            </div>
          )}
        </div>
        <p className="text-lg text-muted-foreground">{actor.biography}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Extended Biography */}
          {actor.biography && (
            <Card>
              <CardHeader>
                <CardTitle>Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {actor.biography}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Filmography */}
          {actor.movies && actor.movies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  Notable Filmography
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {actor.movies.map((movie, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <Link
                          href={`/movies/${movie.id}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {movie.title}
                        </Link>
                        {movie.role && (
                          <p className="text-sm text-muted-foreground">
                            as {movie.role}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Full Name</h4>
                <p className="text-muted-foreground">{actor.name}</p>
              </div>

              <Separator />

              {actor.birthDate && (
                <>
                  <div>
                    <h4 className="font-semibold mb-1">Date of Birth</h4>
                    <p className="text-muted-foreground">
                      {formatDate(actor.birthDate)}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {actor.placeOfBirth && (
                <>
                  <div>
                    <h4 className="font-semibold mb-1">Place of Birth</h4>
                    <p className="text-muted-foreground">
                      {actor.placeOfBirth}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {actor.nationality && (
                <>
                  <div>
                    <h4 className="font-semibold mb-1">Nationality</h4>
                    <Badge variant="outline">{actor.nationality}</Badge>
                  </div>
                  <Separator />
                </>
              )}

              {age && (
                <div>
                  <h4 className="font-semibold mb-1">Age</h4>
                  <p className="text-muted-foreground">{age} years old</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Known For */}
          {actor.movies && actor.movies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Known For</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {actor.movies.slice(0, 5).map((movie, index) => (
                    <Badge key={index} variant="secondary">
                      {movie.title}
                    </Badge>
                  ))}
                  {actor.movies.length > 5 && (
                    <Badge variant="outline">
                      +{actor.movies.length - 5} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
