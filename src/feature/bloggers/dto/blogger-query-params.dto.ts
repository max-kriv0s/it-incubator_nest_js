import { IsEnum, IsOptional, IsString } from 'class-validator';

enum sortDirection {
  asc = 'asc',
  desc = 'desc',
}

export class BloggerQueryParams {
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
