import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LikeStatus } from './like-status';

export class LikeInputDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
