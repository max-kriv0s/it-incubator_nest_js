import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(15)
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  readonly description: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Matches('^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$')
  readonly websiteUrl: string;
}
