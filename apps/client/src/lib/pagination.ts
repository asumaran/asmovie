export const DEFAULT_ITEMS_PER_PAGE = 6;
export const ITEMS_PER_PAGE_OPTIONS = [6, 12, 24] as const;

export function paginateArray<T>(
  array: T[],
  page: number,
  itemsPerPage: number = DEFAULT_ITEMS_PER_PAGE,
) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    items: array.slice(startIndex, endIndex),
    totalPages: Math.ceil(array.length / itemsPerPage),
    totalItems: array.length,
    currentPage: page,
    hasNextPage: endIndex < array.length,
    hasPreviousPage: page > 1,
    itemsPerPage,
  };
}

export function getCurrentPage(searchParams: URLSearchParams): number {
  const page = searchParams.get('page');
  const pageNumber = page ? Number.parseInt(page, 10) : 1;
  return pageNumber > 0 ? pageNumber : 1;
}

export function getItemsPerPage(searchParams: URLSearchParams): number {
  const perPage = searchParams.get('per_page');
  const itemsPerPage = perPage
    ? Number.parseInt(perPage, 10)
    : DEFAULT_ITEMS_PER_PAGE;

  // Validate that the value is one of the allowed options
  if (ITEMS_PER_PAGE_OPTIONS.includes(itemsPerPage as any)) {
    return itemsPerPage;
  }

  return DEFAULT_ITEMS_PER_PAGE;
}
