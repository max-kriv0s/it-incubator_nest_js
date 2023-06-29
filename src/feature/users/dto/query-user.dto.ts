import { IsEnum, IsOptional, IsString } from 'class-validator';

enum sortDirection {
  asc = 'asc',
  desc = 'desc',
}

export class QueryUserDto {
  @IsOptional()
  readonly pageNumber: string;

  @IsOptional()
  readonly pageSize: string;

  @IsString()
  @IsOptional()
  readonly sortBy: string;

  @IsString()
  @IsOptional()
  @IsEnum(sortDirection)
  readonly sortDirection: sortDirection;

  @IsString()
  @IsOptional()
  readonly searchLoginTerm: string;

  @IsString()
  @IsOptional()
  readonly searchEmailTerm: string;
}
