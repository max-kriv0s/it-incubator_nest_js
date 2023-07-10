import { Paginator } from '../../../dto';

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

export class PaginatorUserView extends Paginator {
  readonly items: ViewUserDto[];
}
