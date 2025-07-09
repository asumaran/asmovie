import type { SortOption } from '@/components/sort-selector';

// Movie sorting options
export type MovieSortOption = SortOption & { sortOrder?: 'asc' | 'desc' };

export const MOVIE_SORT_OPTIONS: MovieSortOption[] = [
  { value: 'createdAt', label: 'Recently Added', sortOrder: 'desc' },
  { value: 'releaseYear', label: 'Newest First', sortOrder: 'desc' },
  { value: 'title', label: 'A to Z', sortOrder: 'asc' },
  { value: 'director', label: 'Director', sortOrder: 'asc' },
  { value: 'genre', label: 'Genre', sortOrder: 'asc' },
  { value: 'budget', label: 'Budget', sortOrder: 'desc' },
  { value: 'boxOffice', label: 'Box Office', sortOrder: 'desc' },
];

// Actor sorting options
export type ActorSortOption = SortOption & { sortOrder?: 'asc' | 'desc' };

export const ACTOR_SORT_OPTIONS: ActorSortOption[] = [
  { value: 'createdAt', label: 'Recently Added', sortOrder: 'desc' },
  { value: 'name', label: 'A to Z', sortOrder: 'asc' },
  { value: 'nationality', label: 'Nationality', sortOrder: 'asc' },
  { value: 'birthDate', label: 'Birth Date', sortOrder: 'desc' },
];

// Search sorting options
export const SEARCH_SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'releaseYear', label: 'Newest First' },
  { value: 'title', label: 'A to Z' },
  { value: 'name', label: 'Name' },
  { value: 'director', label: 'Director' },
  { value: 'nationality', label: 'Nationality' },
];

export function getSortValue(
  searchParams: URLSearchParams,
  defaultSort: string,
): string {
  return searchParams.get('sort') || defaultSort;
}

export function sortMovies(movies: any[], sortBy: string) {
  const moviesCopy = [...movies];

  switch (sortBy) {
    case 'rating-desc':
      return moviesCopy.sort((a, b) => b.rating - a.rating);
    case 'rating-asc':
      return moviesCopy.sort((a, b) => a.rating - b.rating);
    case 'year-desc':
      return moviesCopy.sort((a, b) => b.year - a.year);
    case 'year-asc':
      return moviesCopy.sort((a, b) => a.year - b.year);
    case 'title-asc':
      return moviesCopy.sort((a, b) => a.title.localeCompare(b.title));
    case 'title-desc':
      return moviesCopy.sort((a, b) => b.title.localeCompare(a.title));
    case 'popularity-desc':
      // Sort by rating as a proxy for popularity
      return moviesCopy.sort((a, b) => {
        // First by rating, then by box office if available
        const ratingDiff = b.rating - a.rating;
        if (ratingDiff !== 0) return ratingDiff;

        // Extract numeric value from box office for secondary sort
        const getBoxOfficeValue = (movie: any) => {
          if (!movie.boxOffice) return 0;
          const match = movie.boxOffice.match(
            /\$?([\d.]+)\s*(million|billion)?/i,
          );
          if (!match) return 0;
          const value = Number.parseFloat(match[1]);
          const unit = match[2]?.toLowerCase();
          if (unit === 'billion') return value * 1000;
          return value;
        };

        return getBoxOfficeValue(b) - getBoxOfficeValue(a);
      });
    default:
      return moviesCopy;
  }
}

export function sortActors(actors: any[], sortBy: string) {
  const actorsCopy = [...actors];

  switch (sortBy) {
    case 'name-asc':
      return actorsCopy.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return actorsCopy.sort((a, b) => b.name.localeCompare(a.name));
    case 'age-desc':
      return actorsCopy.sort((a, b) => b.age - a.age);
    case 'age-asc':
      return actorsCopy.sort((a, b) => a.age - b.age);
    case 'popularity-desc':
      // Sort by number of known films and awards as popularity proxy
      return actorsCopy.sort((a, b) => {
        const aPopularity = (a.knownFor?.length || 0) + (a.awards?.length || 0);
        const bPopularity = (b.knownFor?.length || 0) + (b.awards?.length || 0);
        return bPopularity - aPopularity;
      });
    default:
      return actorsCopy;
  }
}

export function sortSearchResults(results: any[], sortBy: string) {
  const resultsCopy = [...results];

  switch (sortBy) {
    case 'relevance':
      // Keep original order (search relevance)
      return resultsCopy;
    case 'rating-desc':
      return resultsCopy.sort((a, b) => {
        // Movies have rating, actors don't - prioritize movies with higher ratings
        const aRating = a.type === 'movie' ? a.rating : 0;
        const bRating = b.type === 'movie' ? b.rating : 0;
        return bRating - aRating;
      });
    case 'year-desc':
      return resultsCopy.sort((a, b) => {
        // Movies have year, actors have birth year - use appropriate field
        const aYear =
          a.type === 'movie' ? a.year : new Date().getFullYear() - a.age;
        const bYear =
          b.type === 'movie' ? b.year : new Date().getFullYear() - b.age;
        return bYear - aYear;
      });
    case 'title-asc':
      return resultsCopy.sort((a, b) => {
        const aTitle = a.type === 'movie' ? a.title : a.name;
        const bTitle = b.type === 'movie' ? b.title : b.name;
        return aTitle.localeCompare(bTitle);
      });
    default:
      return resultsCopy;
  }
}
