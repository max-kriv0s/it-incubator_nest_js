import { LikeStatus } from '../../../feature/likes/dto/like-status';
import { Paginator } from '../../../dto';
import { ViewLikeDetailsDto } from '../../../feature/likes/dto/view-like.dto';

export class ViewBloggerBlogDto {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly websiteUrl: string;
  readonly createdAt: string;
  readonly isMembership: boolean;
}

export class PaginatorBloggerBlogView extends Paginator {
  readonly items: ViewBloggerBlogDto[];
}

export class ExtendedLikesInfoViewDto {
  readonly likesCount: number;
  readonly dislikesCount: number;
  readonly myStatus: LikeStatus;
  readonly newestLikes: ViewLikeDetailsDto[];
}

export class ViewBloggerPostDto {
  readonly id: string;
  readonly title: string;
  readonly shortDescription: string;
  readonly content: string;
  readonly blogId: string;
  readonly blogName: string;
  readonly createdAt: string;
  readonly extendedLikesInfo: ExtendedLikesInfoViewDto;
}

export class PaginatorBloggerPostView extends Paginator {
  readonly items: ViewBloggerPostDto[];
}
