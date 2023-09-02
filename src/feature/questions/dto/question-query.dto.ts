import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum SortDirection {
  asc = 'asc',
  desc = 'desc',
}

export enum PublishedStatusEnum {
  all = 'all',
  published = 'published',
  notPublished = 'notPublished',
}

export class QuestionQueryDto {
  @IsOptional()
  @IsString()
  bodySearchTerm: string;

  @IsOptional()
  @IsString()
  @IsEnum(PublishedStatusEnum)
  publishedStatus: PublishedStatusEnum;

  @IsOptional()
  @IsString()
  sortBy: string;

  @IsOptional()
  @IsString()
  @IsEnum(SortDirection)
  sortDirection: SortDirection;

  @IsOptional()
  @IsString()
  pageNumber: string;

  @IsOptional()
  @IsString()
  pageSize: string;
}
