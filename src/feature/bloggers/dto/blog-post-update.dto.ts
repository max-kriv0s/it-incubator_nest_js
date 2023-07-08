import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class BlogPostUpdateDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  readonly title: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly shortDescription: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  readonly content: string;
}
