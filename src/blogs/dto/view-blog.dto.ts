import { Paginator } from 'src/dto';

export class ViewBlogDto {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly websiteUrl: string;
  readonly createdAt: string;
  readonly isMembership: boolean;
}

export class PaginatorBlogView extends Paginator {
  readonly items: ViewBlogDto[];
}
