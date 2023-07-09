import { IsEnum, IsOptional, IsString } from 'class-validator';

enum sortDirection {
  asc = 'asc',
  desc = 'desc',
}

export class QueryParamsAllBlogs {
  @IsString()
  @IsOptional()
  readonly searchNameTerm: string;

  @IsString()
  @IsOptional()
  readonly sortBy: string;

  @IsString()
  @IsOptional()
  @IsEnum(sortDirection)
  readonly sortDirection: sortDirection;

  @IsOptional()
  @IsString()
  readonly pageNumber: string;

  @IsOptional()
  @IsString()
  readonly pageSize: string;
}
