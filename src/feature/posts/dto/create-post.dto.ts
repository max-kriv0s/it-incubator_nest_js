import { Transform } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { BlogExists } from '../validators/blog-exists.validator';

export class CreatePostDto {
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

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  @BlogExists()
  readonly blogId: string;
}
