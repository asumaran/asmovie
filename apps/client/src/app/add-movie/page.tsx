'use client';

import type React from 'react';

import { ProtectedRoute } from '@/components/protected-route';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  createMovie,
  getAllActors,
  type CreateMovieData,
  type SearchItem,
} from '@/lib/api';
import { AlertCircle, CheckCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const genres = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'War',
];

export default function AddMoviePage() {
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    genre: '',
    duration: '',
    description: '',
    plot: '',
    director: '',
    writers: '',
    budget: '',
    boxOffice: '',
  });
  const [actors, setActors] = useState<SearchItem[]>([]);
  const [selectedActors, setSelectedActors] = useState<
    Array<{ actorId: string; role: string }>
  >([]);
  const [loadingActors, setLoadingActors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Load actors on component mount
  useEffect(() => {
    const fetchActors = async () => {
      try {
        setLoadingActors(true);
        const actorsData = await getAllActors();
        setActors(actorsData);
      } catch (error) {
        console.error('Error fetching actors:', error);
      } finally {
        setLoadingActors(false);
      }
    };

    fetchActors();
  }, []);

  const addActor = () => {
    setSelectedActors([...selectedActors, { actorId: '', role: '' }]);
  };

  const removeActor = (index: number) => {
    setSelectedActors(selectedActors.filter((_, i) => i !== index));
  };

  const updateActor = (
    index: number,
    field: 'actorId' | 'role',
    value: string | number,
  ) => {
    const updated = [...selectedActors];
    if (field === 'actorId') {
      updated[index].actorId = value as string;
    } else {
      updated[index].role = value as string;
    }
    setSelectedActors(updated);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (
      !formData.title ||
      !formData.year ||
      !formData.genre ||
      !formData.director
    ) {
      setError(
        'Please fill in all required fields (Title, Year, Genre, Director)',
      );
      setIsLoading(false);
      return;
    }

    const year = Number.parseInt(formData.year);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 5) {
      setError('Please enter a valid year');
      setIsLoading(false);
      return;
    }

    // Validate selected actors
    if (selectedActors.length > 0) {
      const invalidActors = selectedActors.some(
        (actor) => !actor.actorId || !actor.role.trim(),
      );
      if (invalidActors) {
        setError(
          'Please select an actor and provide a role for all added actors, or remove incomplete entries',
        );
        setIsLoading(false);
        return;
      }
    }

    // Note: Rating validation removed since averageRating is not sent to API
    // The rating field can remain in the UI for future use or reference

    try {
      // Prepare data for API
      const movieData: CreateMovieData = {
        title: formData.title,
        releaseYear: Number.parseInt(formData.year),
        genre: formData.genre,
        director: formData.director,
        description: formData.description || undefined,
        plot: formData.plot || undefined,
        duration: formData.duration
          ? Number.parseInt(formData.duration.replace(/\D/g, ''))
          : undefined,
        budget: formData.budget
          ? Number.parseInt(formData.budget.replace(/\D/g, ''))
          : undefined,
        boxOffice: formData.boxOffice
          ? Number.parseInt(formData.boxOffice.replace(/\D/g, ''))
          : undefined,
        writers: formData.writers || undefined,
        actors:
          selectedActors.length > 0
            ? selectedActors.map((a) => ({
                actorId: Number(a.actorId),
                role: a.role,
              }))
            : undefined,
      };

      // Call the API to create the movie
      const newMovie = await createMovie(movieData);

      console.log('Movie created successfully:', newMovie);

      setSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          title: '',
          year: '',
          genre: '',
          duration: '',
          description: '',
          plot: '',
          director: '',
          writers: '',
          budget: '',
          boxOffice: '',
        });
        setSelectedActors([]);
        setSuccess(false);
        // Optionally redirect to the movie detail page
        // router.push(`/movies/${newMovie.id}`);
      }, 3000);
    } catch (err) {
      console.error('Error creating movie:', err);
      let errorMessage = 'Failed to add movie. Please try again.';
      if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as { message?: unknown }).message === 'string'
      ) {
        errorMessage = (err as { message: string }).message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Add New Movie</h1>
          <p className="text-muted-foreground">
            Fill in the details to add a new movie to the database
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Movie Information</CardTitle>
            <CardDescription>
              Please provide accurate information about the movie. Required
              fields are marked with *
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Movie added successfully!</AlertDescription>
                </Alert>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter movie title"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    placeholder="2024"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre">Genre *</Label>
                  <Select
                    value={formData.genre}
                    onValueChange={(value) => handleInputChange('genre', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) =>
                      handleInputChange('duration', e.target.value)
                    }
                    placeholder="120 min"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="director">Director *</Label>
                  <Input
                    id="director"
                    value={formData.director}
                    onChange={(e) =>
                      handleInputChange('director', e.target.value)
                    }
                    placeholder="Director name"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Description and Plot */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="Brief description of the movie"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plot">Plot</Label>
                  <Textarea
                    id="plot"
                    value={formData.plot}
                    onChange={(e) => handleInputChange('plot', e.target.value)}
                    placeholder="Detailed plot description"
                    rows={4}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="writers">Writers</Label>
                  <Input
                    id="writers"
                    value={formData.writers}
                    onChange={(e) =>
                      handleInputChange('writers', e.target.value)
                    }
                    placeholder="Writer 1, Writer 2, Writer 3"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate multiple writers with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Main Cast</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addActor}
                      disabled={isLoading || loadingActors}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Actor
                    </Button>
                  </div>

                  {selectedActors.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No actors selected. Click "Add Actor" to add actors to
                      this movie.
                    </p>
                  )}

                  {selectedActors.map((selectedActor, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`actor-${index}`}>Actor</Label>
                        <Select
                          value={selectedActor.actorId}
                          onValueChange={(value) =>
                            updateActor(index, 'actorId', value)
                          }
                          disabled={isLoading || loadingActors}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an actor" />
                          </SelectTrigger>
                          <SelectContent>
                            {actors.map((actor) => (
                              <SelectItem
                                key={actor.id}
                                value={actor.id.toString()}
                              >
                                {actor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`role-${index}`}>Role</Label>
                        <Input
                          id={`role-${index}`}
                          value={selectedActor.role}
                          onChange={(e) =>
                            updateActor(index, 'role', e.target.value)
                          }
                          placeholder="Character name or role"
                          disabled={isLoading}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeActor(index)}
                        disabled={isLoading}
                        className="mb-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) =>
                      handleInputChange('budget', e.target.value)
                    }
                    placeholder="$50 million"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="boxOffice">Box Office</Label>
                  <Input
                    id="boxOffice"
                    value={formData.boxOffice}
                    onChange={(e) =>
                      handleInputChange('boxOffice', e.target.value)
                    }
                    placeholder="$500 million"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Movie...
                    </>
                  ) : (
                    'Add Movie'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
