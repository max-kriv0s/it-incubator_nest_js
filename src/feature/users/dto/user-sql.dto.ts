export class UserSqlDto {
  id: string;
  isBanned: boolean;
}

export class LoginUserSqlDto {
  id: string;
  password: string;
  isBanned: boolean;
  isConfirmed: boolean;
}
