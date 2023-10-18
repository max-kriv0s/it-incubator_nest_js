import { OldPaginator, Paginator, PaginatorType } from '../../../dto';
import { LikeStatus } from '../../likes/dto/like-status';
import { ViewLikeDetailsDto } from '../../likes/dto/view-like.dto';
import { PostPhotosEntity } from '../entities/post-photos.entity';

export class ExtendedLikesInfoViewDto {
  readonly likesCount: number;
  readonly dislikesCount: number;
  readonly myStatus: LikeStatus;
  readonly newestLikes: ViewLikeDetailsDto[];
}

export class ViewPostDto {
  readonly id: string;
  readonly title: string;
  readonly shortDescription: string;
  readonly content: string;
  readonly blogId: string;
  readonly blogName: string;
  readonly createdAt: string;
  readonly extendedLikesInfo: ExtendedLikesInfoViewDto;
}

export class PaginatorPostView extends OldPaginator<ViewPostDto> {}

export type PaginatorPostSqlType = PaginatorType<ViewPostDto>;
export class PaginatorPostSql extends Paginator<ViewPostDto> {
  constructor(page: number, pageSize: number) {
    super(page, pageSize);
  }
}

export type PostQueryRawType = {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  createdAt: Date;
  blogId: number;
  blogName: string;
  myStatus: LikeStatus;
  likesCount: number;
  dislikesCount: number;
};

export type PostQueryType = PostQueryRawType & {
  newestLikes: NewestLikesType[];
  photos: PostPhotosEntity[];
};

export type NewestLikesType = {
  postId: number;
  addedAt: Date;
  userId: number;
  login: string;
};
