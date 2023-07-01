import { IsNotEmpty, IsString } from 'class-validator';

export class RegistrationConfirmationCodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
