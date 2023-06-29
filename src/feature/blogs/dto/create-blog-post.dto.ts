import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBlogPostDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly shortDescription: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  readonly content: string;
}
