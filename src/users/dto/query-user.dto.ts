export class QueryUserDto {
  readonly pageNumber: string;
  readonly pageSize: string;
  readonly sortBy: string;
  readonly sortDirection: 'asc' | 'desc';
  readonly searchLoginTerm: string;
  readonly searchEmailTerm: string;
}
