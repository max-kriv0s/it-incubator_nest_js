import { LikeStatus } from 'src/feature/likes/dto/like-status';

export class LikePostsRawSqlDocument {
  id: number;
  postId: number;
  userId: number;
  addedAt: Date;
  status: LikeStatus;
}
export class LikePostsSqlDocument {
  id: string;
  postId: string;
  userId: string;
  addedAt: Date;
  status: LikeStatus;
}

export function convertLikePostRawSqlToSqlDocument(
  like: LikePostsRawSqlDocument,
): LikePostsSqlDocument {
  return {
    ...like,
    id: like.id.toString(),
    postId: like.postId.toString(),
    userId: like.userId.toString(),
  };
}
