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
import { Textarea } from '@/components/ui/textarea';
import { createActor, type CreateActorData } from '@/lib/api';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddActorPage() {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    placeOfBirth: '',
    nationality: '',
    description: '',
    biography: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess(false);
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!formData.name.trim()) {
      setError('Please fill in the required field: Actor Name');
      setIsLoading(false);
      return;
    }

    // Validate birth date if provided
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        setError('Birth date cannot be in the future');
        setIsLoading(false);
        return;
      }

      const age = calculateAge(formData.birthDate);
      if (age < 0 || age > 120) {
        setError('Please enter a valid birth date');
        setIsLoading(false);
        return;
      }
    }

    try {
      // Prepare data for API
      const actorData: CreateActorData = {
        name: formData.name.trim(),
        birthDate: formData.birthDate || undefined,
        placeOfBirth: formData.placeOfBirth.trim() || undefined,
        nationality: formData.nationality.trim() || undefined,
        description: formData.description.trim() || undefined,
        biography: formData.biography.trim() || undefined,
      };

      // Call the API to create the actor
      const newActor = await createActor(actorData);

      console.log('Actor created successfully:', newActor);

      setSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          birthDate: '',
          placeOfBirth: '',
          nationality: '',
          description: '',
          biography: '',
        });
        setSuccess(false);
        // Optionally redirect to the actor detail page
        // router.push(`/actors/${newActor.id}`);
      }, 3000);
    } catch (err) {
      console.error('Error creating actor:', err);
      let errorMessage = 'Failed to add actor. Please try again.';
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
          <h1 className="text-4xl font-bold mb-2">Add New Actor</h1>
          <p className="text-muted-foreground">
            Fill in the details to add a new actor to the database
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actor Information</CardTitle>
            <CardDescription>
              Please provide accurate information about the actor. Only the name
              is required.
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
                  <AlertDescription>Actor added successfully!</AlertDescription>
                </Alert>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter actor's full name"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      handleInputChange('birthDate', e.target.value)
                    }
                    disabled={isLoading}
                  />
                  {formData.birthDate && (
                    <p className="text-sm text-muted-foreground">
                      Age: {calculateAge(formData.birthDate)} years old
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="placeOfBirth">Birth Place</Label>
                  <Input
                    id="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={(e) =>
                      handleInputChange('placeOfBirth', e.target.value)
                    }
                    placeholder="City, State/Province, Country"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) =>
                      handleInputChange('nationality', e.target.value)
                    }
                    placeholder="Enter nationality (e.g., American, British, Canadian)"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Biography */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="Brief description of the actor (2-3 sentences)"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="biography">Full Biography</Label>
                  <Textarea
                    id="biography"
                    value={formData.biography}
                    onChange={(e) =>
                      handleInputChange('biography', e.target.value)
                    }
                    placeholder="Detailed biography including career highlights, background, and achievements"
                    rows={5}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-0">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Actor...
                    </>
                  ) : (
                    'Add Actor'
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
