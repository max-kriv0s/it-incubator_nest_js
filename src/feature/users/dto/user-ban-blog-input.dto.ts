import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UserBanBlogInputDto {
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
}
