'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { getMovieById, deleteMovie } from '@/lib/api';
import {
  AlertCircle,
  Calendar,
  Clock,
  DollarSign,
  Loader2,
  Star,
  Trash2,
  Trophy,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function MovieLoadingSkeleton() {
  return (
    <div className="container mx-auto py-8">
      {/* Back Button Skeleton */}
      <div className="h-10 bg-muted rounded w-32 animate-pulse mb-6"></div>

      {/* Movie Header Skeleton */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="h-12 bg-muted rounded w-96 animate-pulse mb-2"></div>
            <div className="flex items-center gap-4">
              <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
              <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
          </div>
        </div>
        <div className="h-6 bg-muted rounded w-full animate-pulse"></div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-24 animate-pulse"></div>
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

// Define el tipo Movie según tu modelo real
interface Movie {
  id: number;
  title: string;
  releaseYear?: number;
  duration?: number | string;
  genre?: string;
  averageRating?: number;
  description?: string;
  plot?: string;
  actors?: { id: number; name: string; role?: string }[];
  awards?: string;
  director?: string;
  writers?: string;
  budget?: number | string;
  boxOffice?: number | string;
}

export default function MoviePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleDelete = async () => {
    if (!movie) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      await deleteMovie(movie.id);
      // Redirect to movies page after successful deletion
      router.push('/movies');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete movie');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    async function fetchMovie() {
      try {
        const movieId = Number.parseInt(id);
        if (isNaN(movieId)) {
          notFound();
          return;
        }

        setIsLoading(true);
        const movieData = await getMovieById(movieId);

        if (!movieData) {
          notFound();
          return;
        }

        setMovie(movieData);
      } catch (err: any) {
        setError(err.message || 'Failed to load movie');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovie();
  }, [id]);

  if (isLoading) {
    return <MovieLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">Error Loading Movie</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!movie) {
    notFound();
  }

  // Format budget and box office
  const formatCurrency = (amount: number | string | undefined) => {
    if (!amount) return null;
    if (typeof amount === 'string') return amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-8">

      {/* Movie Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{movie.releaseYear}</span>
              </div>
              {movie.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{typeof movie.duration === 'number' ? `${movie.duration} min` : movie.duration}</span>
                </div>
              )}
              {movie.genre && <Badge variant="outline">{movie.genre}</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">{movie.averageRating?.toFixed(1) || 'N/A'}</span>
              <span className="text-muted-foreground">/10</span>
            </div>
            {user && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Movie
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      "{movie.title}" from the database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  {deleteError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{deleteError}</AlertDescription>
                    </Alert>
                  )}
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Movie'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        <p className="text-lg text-muted-foreground">{movie.description}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Plot */}
          {movie.plot && movie.plot !== movie.description && (
            <Card>
              <CardHeader>
                <CardTitle>Plot</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {movie.plot}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Cast */}
          {movie.actors && movie.actors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {movie.actors.map((actor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <Link
                          href={`/actors/${actor.id}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {actor.name}
                        </Link>
                        {actor.role && (
                          <p className="text-sm text-muted-foreground">
                            {actor.role}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Awards */}
          {movie.awards && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Awards & Recognition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {movie.awards.split(',').map((award, index) => (
                    <Badge key={index} variant="secondary">
                      {award.trim()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Movie Details */}
          <Card>
            <CardHeader>
              <CardTitle>Movie Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {movie.director && (
                <>
                  <div>
                    <h4 className="font-semibold mb-1">Director</h4>
                    <p className="text-muted-foreground">{movie.director}</p>
                  </div>
                  <Separator />
                </>
              )}

              {movie.writers && (
                <>
                  <div>
                    <h4 className="font-semibold mb-1">Writers</h4>
                    <p className="text-muted-foreground">{movie.writers}</p>
                  </div>
                  <Separator />
                </>
              )}

              {movie.genre && (
                <>
                  <div>
                    <h4 className="font-semibold mb-1">Genre</h4>
                    <Badge variant="outline">{movie.genre}</Badge>
                  </div>
                  <Separator />
                </>
              )}

              {movie.duration && (
                <div>
                  <h4 className="font-semibold mb-1">Duration</h4>
                  <p className="text-muted-foreground">
                    {movie.duration} minutes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Box Office */}
          {(movie.budget || movie.boxOffice) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Box Office
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {movie.budget && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-1">Budget</h4>
                      <p className="text-muted-foreground">
                        {formatCurrency(movie.budget)}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                {movie.boxOffice && (
                  <div>
                    <h4 className="font-semibold mb-1">Box Office</h4>
                    <p className="text-muted-foreground">
                      {formatCurrency(movie.boxOffice)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
