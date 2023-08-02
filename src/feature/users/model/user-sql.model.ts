export class UserRawSqlDocument {
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

export class UserSqlDocument {
  id: string;
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

export function convertUserRawSqlToSqlDocument(
  user: UserRawSqlDocument,
): UserSqlDocument {
  return {
    ...user,
    id: user.id.toString(),
  };
}
