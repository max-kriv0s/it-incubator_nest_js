import { OldPaginator, Paginator, PaginatorType } from '../../../dto';

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

export type PaginatorUserSqlType = PaginatorType<ViewUserDto>;
export class PaginatorUserSql extends Paginator<ViewUserDto> {
  constructor(public page: number, public pageSize: number) {
    super(page, pageSize);
  }
}
