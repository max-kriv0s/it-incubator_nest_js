import { Paginator } from '../../../dto';

export class UsersBlogOwnerInfoViewModel {
  readonly userId: string;
  readonly userLogin: string;
}

export class UsersBlogViewDto {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly websiteUrl: string;
  readonly createdAt: string;
  readonly isMembership: boolean;
  readonly blogOwnerInfo: UsersBlogOwnerInfoViewModel;
}

export class PaginatorUsersBlogView extends Paginator {
  readonly items: UsersBlogViewDto[];
}
