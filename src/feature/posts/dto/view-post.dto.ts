import { Paginator } from '../../../dto';
import { LikeStatus } from '../../likes/dto/like-status';
import { ViewLikeDetailsDto } from '../../likes/dto/view-like.dto';

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

export class PaginatorPostView extends Paginator {
  readonly items: ViewPostDto[];
}