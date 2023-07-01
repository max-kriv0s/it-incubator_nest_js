import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegistrationEmailResendingDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
