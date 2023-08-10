import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { IdTypes } from '../../../types/id.types';
import { DataSource } from 'typeorm';
import {
  CommentRawSqlDocument,
  CommentSqlDocument,
  convertCommentRawSqlToSqlDocument,
} from '../model/comment-sql.model';
import { UpdateCommentDto } from '../dto/update-comment.dto';

@Injectable()
export class CommentsSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async deleteComments() {
    await this.dataSource.query(`DELETE FROM public."Comments"`);
  }

  async deleteCommentByID(id: string) {
    await this.dataSource.query(
      `DELETE FROM public."Comments"
      WHERE "id" = $1`,
      [+id],
    );
  }

  async createCommentByPostId(
    postId: IdTypes,
    userId: IdTypes,
    content: string,
  ): Promise<CommentSqlDocument> {
    const commentsRaw: CommentRawSqlDocument[] = await this.dataSource.query(
      `INSERT INTO public."Comments"
        ("postId", "userId", "content")
        VALUES
        ($1, $2, $3)
        RETURNING *`,
      [+postId, +userId, content],
    );
    return convertCommentRawSqlToSqlDocument(commentsRaw[0]);
  }

  async updateComment(id: string, commentDto: UpdateCommentDto) {
    await this.dataSource.query(
      `UPDATE public."Comments"
      SET "content" = $2
      WHERE "id" = $1`,
      [+id, commentDto.content],
    );
  }

  async findCommentByID(id: string): Promise<CommentSqlDocument | null> {
    const commentsRaw: CommentRawSqlDocument[] = await this.dataSource.query(
      `SELECT *
      FROM public."Comments"
      WHERE "id" = $1`,
      [+id],
    );
    if (!commentsRaw.length) return null;
    return convertCommentRawSqlToSqlDocument(commentsRaw[0]);
  }

  async updateBanUnban(userId: string, isBanned: boolean) {
    await this.dataSource.query(
      `UPDATE public."Comments"
        SET "isBanned" = $2 
        WHERE "userId" = $1`,
      [+userId, isBanned],
    );
  }
}
