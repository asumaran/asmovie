import { Star } from 'lucide-react';

interface MovieRating {
  id?: number;
  rating: number;
  comment: string;
  reviewer: string;
  createdAt?: string;
}

/**
 * Render star rating component
 */
export function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className="h-4 w-4 text-gray-300" />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: '50%' }}
          >
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      ))}
    </div>
  );
}

/**
 * Calculate the average rating from an array of ratings
 */
export function getAverageRating(ratings?: MovieRating[]): string {
  if (!ratings || ratings.length === 0) return 'N/A';
  const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  return avg.toFixed(1);
}

/**
 * Calculate the average rating as a number
 */
export function getAverageRatingNumber(ratings?: MovieRating[]): number {
  if (!ratings || ratings.length === 0) return 0;
  return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
}

/**
 * Get the highest rating from an array of ratings
 */
export function getHighestRating(ratings?: MovieRating[]): number {
  if (!ratings || ratings.length === 0) return 0;
  return Math.max(...ratings.map((r) => r.rating));
}

/**
 * Get the lowest rating from an array of ratings
 */
export function getLowestRating(ratings?: MovieRating[]): number {
  if (!ratings || ratings.length === 0) return 0;
  return Math.min(...ratings.map((r) => r.rating));
}
