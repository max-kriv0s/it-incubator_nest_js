import { LikeStatus } from '../../../feature/likes/dto/like-status';
import { Paginator } from '../../../dto';

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

export class PaginatorViewBloggerCommentsDto extends Paginator {
  readonly items: ViewBloggerCommentsDto[];
}
