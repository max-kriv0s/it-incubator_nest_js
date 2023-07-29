export class UserSqlDocument {
  id: number;
  login: string;
  password: string;
  email: string;
  createdAt: Date;
  confirmationCode: string;
  emailConfirmationExpirationDate: Date;
  isConfirmed: boolean;
  passwordRecoveryCode: string;
  passwordRecoveryExpirationDate: Date;
  isBanned: boolean;
  banDate: Date;
  banReason: string;
}
