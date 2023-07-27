import { OldPaginator, Paginator } from '../../../dto';

export class ViewUserDto {
  readonly id: string;
  readonly login: string;
  readonly email: string;
  readonly createdAt: string;
  readonly banInfo: {
    isBanned: boolean;
    banDate: string | null;
    banReason: string | null;
  };
}

export class PaginatorUserView extends OldPaginator<ViewUserDto> {}

export class PaginatorUserSqlView extends Paginator<ViewUserDto> {
  constructor(page: number, pageSize: number, totalCount: number) {
    super(page, pageSize);
    this.totalCount = totalCount;
    this.pagesCount = Math.ceil(totalCount / this.pageSize);
  }
}
