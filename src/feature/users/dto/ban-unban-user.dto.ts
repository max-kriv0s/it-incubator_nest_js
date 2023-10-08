import { Transform } from 'class-transformer';
import { IsBoolean, IsString, MinLength } from 'class-validator';

export class BanUnbanUserDto {
  @IsBoolean()
  readonly isBanned;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(20)
  readonly banReason;
}
