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

export class OldPaginator<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}

export type FieldError = {
  message: string;
  field: string;
};

export type PaginatorType<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};

export interface IPaginator<T> {
  page: number;
  pageSize: number;
  skip: number;
  paginate(totalCount: number, data: T[]): PaginatorType<T>;
}
export class Paginator<T> implements IPaginator<T> {
  DEFAULT_PAGE = 1;
  DEFAULT_PAGE_SIZE = 10;
  skip: number;

  constructor(public page: number, public pageSize: number) {
    this.page = page ? page : this.DEFAULT_PAGE;
    this.pageSize = pageSize ? pageSize : this.DEFAULT_PAGE_SIZE;
    this.skip = (this.page - 1) * this.pageSize;
  }

  paginate(totalCount: number, data: T[]): PaginatorType<T> {
    return {
      pagesCount: Math.ceil(totalCount / this.pageSize),
      page: this.page,
      pageSize: this.pageSize,
      totalCount: totalCount,
      items: data,
    };
  }
}
