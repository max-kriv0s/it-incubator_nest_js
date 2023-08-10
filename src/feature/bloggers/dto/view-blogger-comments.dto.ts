import { LikeStatus } from '../../../feature/likes/dto/like-status';
import { OldPaginator, Paginator, PaginatorType } from '../../../dto';

export class ViewBloggerCommentsDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };
  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
  };
}

export class PaginatorViewBloggerCommentsDto extends OldPaginator<ViewBloggerCommentsDto> {}

export type PaginatorBloggerCommentsSqlViewType =
  PaginatorType<ViewBloggerCommentsDto>;
export class PaginatorBloggerCommentsSql extends Paginator<ViewBloggerCommentsDto> {
  constructor(page: number, pageSize: number) {
    super(page, pageSize);
  }
}
