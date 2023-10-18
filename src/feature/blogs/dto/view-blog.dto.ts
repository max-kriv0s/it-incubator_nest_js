import { OldPaginator, Paginator, PaginatorType } from '../../../dto';
import { BlogImageView } from './blog-image-view.dto';

export class ViewBlogDto {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly websiteUrl: string;
  readonly createdAt: string;
  readonly isMembership: boolean;
  readonly images: BlogImageView;
}

export class PaginatorBlogView extends OldPaginator<ViewBlogDto> {}

export type PaginatorBlogSqlType = PaginatorType<ViewBlogDto>;
export class PaginatorBlogSql extends Paginator<ViewBlogDto> {
  constructor(page: number, pageSize: number) {
    super(page, pageSize);
  }
}
