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
import { deleteMovie, getMovieById } from '@/lib/api';
import {
  getAverageRating,
  getAverageRatingNumber,
  getHighestRating,
  getLowestRating,
  renderStars,
} from '@/lib/ratings';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Loader2,
  MessageSquare,
  Star,
  Trash2,
  Trophy,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Movie {
  id: number;
  title: string;
  description?: string;
  plot?: string;
  releaseYear?: number;
  duration?: number | string;
  genre?: string;
  director?: string;
  writers?: string;
  budget?: number | string;
  boxOffice?: number | string;
  awards?: string;
  ratings?: Array<{
    id?: number;
    rating: number;
    comment: string;
    reviewer: string;
    createdAt?: string;
  }>;
  actors?: Array<{
    id?: number;
    name?: string;
    role?: string;
    actor?: { id: number; name: string };
  }>;
}

interface MoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

function MoviePageClient({ movieId }: { movieId: number }) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchMovie() {
      try {
        const movieData = await getMovieById(movieId);
        if (!movieData) {
          notFound();
        }
        setMovie(movieData);
      } catch (error) {
        console.error('Error fetching movie:', error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovie();
  }, [movieId]);

  const handleDelete = async () => {
    if (!movie) return;

    // Check if user is authenticated
    if (!user) {
      setDeleteError('You must be logged in to delete a movie');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteMovie(movie.id);
      // Redirect to movies page after successful deletion
      router.push('/movies');
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : 'Failed to delete movie',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  // Format currency for budget and box office
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!movie) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/movies">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Movies
        </Link>
      </Button>

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
                  <span>
                    {typeof movie.duration === 'number'
                      ? `${movie.duration} min`
                      : movie.duration}
                  </span>
                </div>
              )}
              {movie.genre && <Badge variant="outline">{movie.genre}</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">
                {getAverageRating(movie.ratings)}
              </span>
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
                      &ldquo;{movie.title}&rdquo; from the database.
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
                          href={`/actors/${actor.actor ? actor.actor.id : actor.id}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {actor.actor ? actor.actor.name : actor.name}
                        </Link>
                        {actor.role && (
                          <p className="text-sm text-muted-foreground">
                            as {actor.role}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Ratings */}
          {movie.ratings && movie.ratings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  User Reviews ({movie.ratings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {movie.ratings.map((rating, index) => (
                    <div
                      key={rating.id || index}
                      className="border-b border-border pb-6 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {renderStars(rating.rating / 2)}{' '}
                            {/* Convert 10-point scale to 5-star */}
                            <span className="font-semibold text-lg">
                              {rating.rating}/10
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {rating.createdAt
                              ? getTimeAgo(rating.createdAt)
                              : 'Recently'}
                          </p>
                          <p className="text-sm font-medium">
                            {rating.reviewer}
                          </p>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {rating.comment}
                      </p>
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
                    {typeof movie.duration === 'number'
                      ? `${movie.duration} minutes`
                      : movie.duration}
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

          {/* Rating Summary */}
          {movie.ratings && movie.ratings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Rating Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {getAverageRating(movie.ratings)}/10
                  </div>
                  <div className="flex justify-center mb-2">
                    {renderStars(getAverageRatingNumber(movie.ratings) / 2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {movie.ratings.length} user review
                    {movie.ratings.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average User Rating:</span>
                    <span className="font-medium">
                      {getAverageRating(movie.ratings)}/10
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Highest Rating:</span>
                    <span className="font-medium">
                      {getHighestRating(movie.ratings)}/10
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Lowest Rating:</span>
                    <span className="font-medium">
                      {getLowestRating(movie.ratings)}/10
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MoviePage({ params }: MoviePageProps) {
  return <MoviePageWrapper params={params} />;
}

function MoviePageWrapper({ params }: MoviePageProps) {
  const [movieId, setMovieId] = useState<number | null>(null);

  useEffect(() => {
    async function resolveParams() {
      const { id } = await params;
      setMovieId(Number.parseInt(id));
    }
    resolveParams();
  }, [params]);

  if (movieId === null) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return <MoviePageClient movieId={movieId} />;
}
