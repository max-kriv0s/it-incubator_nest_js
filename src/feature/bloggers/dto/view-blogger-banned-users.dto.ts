import { OldPaginator, Paginator, PaginatorType } from '../../../dto';

class BanUserInfoViewDto {
  isBanned: boolean;
  banDate: string | null;
  banReason: string | null;
}

export class ViewBloggerBannedUsersDto {
  id: string;
  login: string;
  banInfo: BanUserInfoViewDto;
}

export class PaginatorViewBloggerBannedUsersDto extends OldPaginator<ViewBloggerBannedUsersDto> {}

export type PaginatorViewBloggerBannedUsersSqlType =
  PaginatorType<ViewBloggerBannedUsersDto>;
export class PaginatorViewBloggerBannedUsersSql extends Paginator<ViewBloggerBannedUsersDto> {
  constructor(page: number, pageSize: number) {
    super(page, pageSize);
  }
}
