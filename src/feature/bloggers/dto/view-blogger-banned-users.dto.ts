import { Paginator } from '../../../dto';

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

export class PaginatorViewBloggerBannedUsersDto extends Paginator {
  items: ViewBloggerBannedUsersDto[];
}
