import { Paginator } from 'src/dto';
import { LikeStatus } from 'src/likes/dto/like-status';

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

export class PaginatorCommentView extends Paginator {
  readonly items: ViewCommentDto[];
}
