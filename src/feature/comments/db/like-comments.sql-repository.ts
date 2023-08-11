import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { LikeStatus } from '../../../feature/likes/dto/like-status';
import { DataSource } from 'typeorm';
import {
  LikeCommentsRawSqlDocument,
  LikeCommentsSqlDocument,
  convertLikeCommentRawSqlToSqlDocument,
} from '../model/like-comments-sql.model';

@Injectable()
export class LikeCommentsSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async deleteLikesComments() {
    await this.dataSource.query(`DELETE FROM public."CommentLikes"`);
  }

  async findLikeByCommentIdAndUserId(
    commentId: string,
    userId: string,
  ): Promise<LikeCommentsSqlDocument | null> {
    const likesRaw: LikeCommentsRawSqlDocument[] = await this.dataSource.query(
      `SELECT *
      FROM public."CommentLikes"
      WHERE "commentId" = $1 AND "userId" = $2`,
      [+commentId, +userId],
    );
    if (!likesRaw.length) return null;
    return convertLikeCommentRawSqlToSqlDocument(likesRaw[0]);
  }

  async createLike(commentId: string, userId: string, likeStatus: LikeStatus) {
    await this.dataSource.query(
      `INSERT INTO public."CommentLikes"
      ("commentId", "userId", "status")
      VALUES
      ($1, $2, $3)`,
      [+commentId, +userId, likeStatus],
    );
  }

  async updateLike(id: string, likeStatus: LikeStatus) {
    await this.dataSource.query(
      `UPDATE public."CommentLikes"
      SET status=$2
	    WHERE "id" = $1`,
      [+id, likeStatus],
    );
  }

  async updateBanUnban(userId: string, isBanned: boolean) {
    await this.dataSource.query(
      `UPDATE public."CommentLikes"
        SET "isBanned" = $2 
        WHERE "userId" = $1`,
      [+userId, isBanned],
    );
  }
}
