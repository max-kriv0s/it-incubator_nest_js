import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  LikePostsRawSqlDocument,
  LikePostsSqlDocument,
  convertLikePostRawSqlToSqlDocument,
} from '../model/like-posts-sql.model';
import { LikeStatus } from 'src/feature/likes/dto/like-status';

@Injectable()
export class LikePostsSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async deleteLikesPosts() {
    await this.dataSource.query(`DELETE FROM public."PostLikes"`);
  }

  async findLikeByPostIdAndUserId(
    postId: string,
    userId: string,
  ): Promise<LikePostsSqlDocument | null> {
    const likesRaw: LikePostsRawSqlDocument[] = await this.dataSource.query(
      `SELECT *
      FROM public."PostLikes"
      WHERE "postId" = $1 AND "userId" = $2`,
      [+postId, +userId],
    );
    if (!likesRaw.length) return null;
    return convertLikePostRawSqlToSqlDocument(likesRaw[0]);
  }

  async updateLike(id: string, likeStatus: LikeStatus) {
    await this.dataSource.query(
      `UPDATE public."PostLikes"
      SET status=$2
	    WHERE "id" = $1`,
      [+id, likeStatus],
    );
  }

  async createLike(postId: string, userId: string, likeStatus: LikeStatus) {
    await this.dataSource.query(
      `INSERT INTO public."PostLikes"
      ("postId", "userId", "status")
      VALUES
      ($1, $2, $3)`,
      [+postId, +userId, likeStatus],
    );
  }

  async updateBanUnban(userId: string, isBanned: boolean) {
    await this.dataSource.query(
      `UPDATE public."PostLikes"
        SET "isBanned" = $2 
        WHERE "userId" = $1`,
      [+userId, isBanned],
    );
  }
}
