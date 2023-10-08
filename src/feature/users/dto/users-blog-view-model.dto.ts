import { OldPaginator, Paginator, PaginatorType } from '../../../dto';

export class UsersBlogOwnerInfoViewModel {
  readonly userId: string;
  readonly userLogin: string;
}

export class UsersBlogBanInfo {
  readonly isBanned: boolean;
  readonly banDate: string | null;
}

export class UsersBlogViewDto {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly websiteUrl: string;
  readonly createdAt: string;
  readonly isMembership: boolean;
  readonly blogOwnerInfo: UsersBlogOwnerInfoViewModel;
  readonly banInfo: UsersBlogBanInfo;
}

export class PaginatorUsersBlogView extends OldPaginator<UsersBlogViewDto> {}

export type PaginatorUsersBlogSqlType = PaginatorType<UsersBlogViewDto>;
export class PaginatorUsersBlogSql extends Paginator<UsersBlogViewDto> {
  constructor(page: number, pageSize: number) {
    super(page, pageSize);
  }
}
