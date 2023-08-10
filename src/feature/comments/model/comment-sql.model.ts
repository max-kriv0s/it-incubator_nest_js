import { LikeStatus } from 'src/feature/likes/dto/like-status';

export class CommentRawSqlDocument {
  id: number;
  postId: number;
  userId: number;
  isBanned: boolean;
  content: string;
  createdAt: Date;
}

export class CommentSqlDocument {
  id: string;
  postId: string;
  userId: string;
  isBanned: boolean;
  content: string;
  createdAt: Date;
}

export class CommentForPostRawSqlDocument {
  id: number;
  postId: number;
  userId: number;
  isBanned: boolean;
  content: string;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  userLogin: string;
  title: string;
  blogId: number;
  blogName: string;
}

export function convertCommentRawSqlToSqlDocument(
  comment: CommentRawSqlDocument,
): CommentSqlDocument {
  return {
    ...comment,
    id: comment.id.toString(),
    postId: comment.postId.toString(),
    userId: comment.userId.toString(),
  };
}
