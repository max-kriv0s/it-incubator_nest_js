import { Paginator } from 'src/dto';

export class ViewUserDto {
  readonly id: string;
  readonly login: string;
  readonly email: string;
  readonly createdAt: string;
}

export class PaginatorUserView extends Paginator {
  readonly items: ViewUserDto[];
}
