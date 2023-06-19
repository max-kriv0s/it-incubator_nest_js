export class QueryParams {
  readonly searchNameTerm: string;
  readonly pageNumber: string;
  readonly pageSize: string;
  readonly sortBy: string;
  readonly sortDirection: 'asc' | 'desc';
}

export class Paginator {
  readonly pagesCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
}
