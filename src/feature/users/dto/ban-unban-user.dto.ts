import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, MinLength } from 'class-validator';

export enum IsBannedEnum {
  false = 'false',
  true = 'true',
}

export class BanUnbanUserDto {
  @IsBoolean()
  readonly isBanned;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(20)
  readonly banReason;
}

export class QueryBanUnbanUserDto {
  // @IsBoolean()
  @IsString()
  @IsEnum(IsBannedEnum)
  readonly isBanned;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(20)
  readonly banReason;
}