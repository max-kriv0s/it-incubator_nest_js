import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { BlogExists } from '../../../feature/posts/validators/blog-exists.validator';

export class BloggerBanUserInputDto {
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  banReason: string;

  // @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsNumber()
  // @IsMongoId()
  // @BlogExists()
  blogId: number;
}
