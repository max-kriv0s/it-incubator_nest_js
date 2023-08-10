import { LikeStatus } from 'src/feature/likes/dto/like-status';

export class LikeCommentsRawSqlDocument {
  id: number;
  commentId: number;
  userId: number;
  status: LikeStatus;
}

export class LikeCommentsSqlDocument {
  id: string;
  commentId: string;
  userId: string;
  status: LikeStatus;
}

export function convertLikeCommentRawSqlToSqlDocument(
  like: LikeCommentsRawSqlDocument,
): LikeCommentsSqlDocument {
  return {
    ...like,
    id: like.id.toString(),
    commentId: like.commentId.toString(),
    userId: like.userId.toString(),
  };
}
