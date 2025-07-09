import type { MovieRating } from '../app/movies/page';

export function getAverageRating(ratings?: MovieRating[]): string {
  if (!ratings || ratings.length === 0) return 'N/A';
  const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  return avg.toFixed(1);
}
