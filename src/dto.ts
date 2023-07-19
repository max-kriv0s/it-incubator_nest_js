import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';

enum sortDirection {
  asc = 'asc',
  desc = 'desc',
}

export class QueryParams {
  @IsString()
  @IsOptional()
  readonly searchNameTerm: string;

  @IsString()
  @IsOptional()
  readonly pageNumber: string;

  @IsString()
  @IsOptional()
  readonly pageSize: string;

  @IsString()
  @IsOptional()
  readonly sortBy: string;

  @IsString()
  @IsOptional()
  @IsEnum(sortDirection)
  readonly sortDirection: sortDirection;
}

export class Paginator {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
}

export type FieldError = {
  message: string;
  field: string;
};
