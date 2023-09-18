import { IsEnum, IsOptional, IsString } from 'class-validator';
import { sortDirection } from '../../../types/sort-direction.types';

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
