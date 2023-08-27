import { OldPaginator, Paginator, PaginatorType } from '../../../dto';
import { LikeStatus } from '../../likes/dto/like-status';

export class ViewCommentDto {
  readonly id: string;
  readonly content: string;
  readonly commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  readonly createdAt: string;
  readonly likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };
}

export class PaginatorCommentView extends OldPaginator<ViewCommentDto> {}

export type PaginatorCommentSqlType = PaginatorType<ViewCommentDto>;
export class PaginatorCommentSql extends Paginator<ViewCommentDto> {
  constructor(page: number, pageSize: number) {
    super(page, pageSize);
  }
}

export type CommentQueryRawType = {
  id: number;
  content: string;
  createdAt: Date;
  userId: number;
  userLogin: string;
  postId: number;
  title: string;
  blogId: number;
  blogName: string;
  myStatus: LikeStatus;
  likesCount: number;
  dislikesCount: number;
};
