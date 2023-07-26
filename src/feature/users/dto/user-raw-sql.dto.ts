export class UserRawSqlDto {
  readonly Id: string;
  readonly Login: string;
  readonly Email: string;
  readonly CreatedAt: Date;
  readonly IsBanned: boolean;
  readonly BanDate: Date;
  readonly BanReason: string;
}
