import { IsEnum, IsOptional, IsString } from 'class-validator';

enum sortDirection {
  asc = 'asc',
  desc = 'desc',
}

export class BloggerBannedUsersQueryParams {
  @IsString()
  @IsOptional()
  readonly searchLoginTerm: string;

  @IsString()
  @IsOptional()
  readonly sortBy: string;

  @IsString()
  @IsOptional()
  @IsEnum(sortDirection)
  readonly sortDirection: sortDirection;

  @IsString()
  @IsOptional()
  readonly pageNumber: string;

  @IsString()
  @IsOptional()
  readonly pageSize: string;
}