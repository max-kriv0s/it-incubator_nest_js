import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { sortDirection } from '../../../types/sort-direction.types';
import { Transform } from 'class-transformer';

export class PairQuizGameQueryParams {
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

export class PairQuizGameUsersTopQueryParams {
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly sort: string[];

  @IsString()
  @IsOptional()
  readonly pageNumber: string;

  @IsString()
  @IsOptional()
  readonly pageSize: string;
}
