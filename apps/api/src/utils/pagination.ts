export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function getPaginationParams(query: PaginationQuery): PaginationParams & { sortBy: string; sortOrder: 'ASC' | 'DESC' } {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  const offset = (page - 1) * limit;
  const sortBy = query.sortBy || 'created_at';
  const sortOrder = (query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC') as 'ASC' | 'DESC';

  return { page, limit, offset, sortBy, sortOrder };
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
