import { IsEnum, IsOptional, IsString } from 'class-validator';

enum SortDirection {
  asc = 'asc',
  desc = 'desc',
}

export enum BanStatus {
  all = 'all',
  banned = 'banned',
  notBanned = 'notBanned',
}

export class QueryUserDto {
  @IsOptional()
  @IsString()
  @IsEnum(BanStatus)
  readonly banStatus: BanStatus;

  @IsString()
  @IsOptional()
  readonly searchLoginTerm: string;

  @IsString()
  @IsOptional()
  readonly searchEmailTerm: string;

  @IsString()
  @IsOptional()
  readonly sortBy: string;

  @IsString()
  @IsOptional()
  @IsEnum(SortDirection)
  readonly sortDirection: SortDirection;

  @IsOptional()
  @IsString()
  readonly pageNumber: string;

  @IsOptional()
  @IsString()
  readonly pageSize: string;
}
