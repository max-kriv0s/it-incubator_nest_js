import { LikeStatus } from '../../../feature/likes/dto/like-status';

export class PostRawSqlDocument {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  // blogName: string;
  isBanned: boolean;
  createdAt: Date;
  // likesCount: number;
  // dislikesCount: number;
  // myStatusLike: LikeStatus;
  // newestLikes: NewestLikesType[];
}

export class PostSqlDocument {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  // blogName: string;
  isBanned: boolean;
  createdAt: Date;
  // likesCount: number;
  // dislikesCount: number;
  // myStatusLike: LikeStatus;
  // newestLikes: NewestLikesType[];
}

export class PostWithLikesRawSqlDocument {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  blogName: string;
  isBanned: boolean;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
  myStatusLike: LikeStatus;
  addedAt: Date;
  userId: number;
  login: string;
  // newestLikes: NewestLikesType[];
}

// export type NewestLikesType = {
//   addedAt: Date;
//   userId: string;
//   login: string;
// };

export function convertPostRawSqlToSqlDocument(
  post: PostRawSqlDocument,
): PostSqlDocument {
  return {
    ...post,
    id: post.id.toString(),
    blogId: post.blogId.toString(),
  };
}
