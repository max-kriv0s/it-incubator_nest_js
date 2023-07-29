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

export type PaginatorUserSqlViewType = Omit<
  PaginatorUserSqlView,
  'addItems' | 'getView'
>;
export class PaginatorUserSqlView extends Paginator<ViewUserDto> {
  constructor(page: number, pageSize: number, totalCount: number) {
    super(page, pageSize);
    this.totalCount = totalCount;
    this.pagesCount = Math.ceil(totalCount / this.pageSize);
  }

  // TODO перенести передачу данных и расчет количесва страниц в getView. Пагинатор создает контроллер и передает в репозиторий
  addItems(data: ViewUserDto[]) {
    this.items = data;
  }

  // TODO переименовать в paginate
  getView(): PaginatorUserSqlViewType {
    return {
      pagesCount: this.pagesCount,
      page: this.page,
      pageSize: this.pageSize,
      totalCount: this.totalCount,
      items: this.items,
    };
  }
}
