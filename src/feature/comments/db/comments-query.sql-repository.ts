import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  PaginatorCommentSqlType,
  ViewCommentDto,
} from '../dto/view-comment.dto';
import { CommentRawSqlDocument } from '../model/comment-sql.model';
import { LikeStatus } from '../../../feature/likes/dto/like-status';
import { IdTypes } from '../../../types/id.types';
import { IPaginator, QueryParams } from '../../../dto';

type CommentViewRawType = CommentRawSqlDocument & {
  userLogin: string;
  likesCount: number;
  dislikesCount: number;
  StatusMyLike: LikeStatus;
};

@Injectable()
export class CommentsQuerySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findCommentsByPostId(
    postId: string,
    queryParams: QueryParams,
    paginator: IPaginator<ViewCommentDto>,
    userId?: string,
  ): Promise<PaginatorCommentSqlType | null> {
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const postsRaw: { id: number }[] = await this.dataSource.query(
      `SELECT "id"
        FROM public."Posts"
        WHERE "id" = $1`,
      [+postId],
    );
    if (!postsRaw.length) return null;

    const params: [number | null] = [+postId];
    const commentsCount: { count: number } = await this.dataSource.query(
      `SELECT count(*)
        FROM public."Comments"
        WHERE "id" = $1 AND NOT "isBanned"`,
      params,
    );

    const totalCount = +commentsCount[0].count;

    params.push(userId ? +userId : null);
    const commentsRaw: CommentViewRawType[] = await this.dataSource.query(
      `SELECT "comments".*, 
        users."login" as "userLogin",
        COALESCE((
            SELECT "status" 
            FROM public."CommentLikes" 
            WHERE "commentId" = "comments"."id" and "userId" = $2), 
            'None') as "StatusMyLike",
        SUM(COALESCE(CASE WHEN "likes"."status" = 'Like' 
                        THEN 1
                        ELSE 0
                    END, 0)) as "likesCount",
        SUM(COALESCE(CASE WHEN "likes"."status" = 'Dislike' 
                        THEN 1
                        ELSE 0
                    END, 0)) as "dislikesCount"
      FROM public."Comments" as comments
        LEFT JOIN public."Users" as users
            ON comments."userId" = users."id"
        LEFT JOIN public."CommentLikes" as "likes"
                ON comments."id" = "likes"."commentId"
      WHERE comments."postId" = $1 AND NOT comments."isBanned"
	  GROUP BY comments."id", users."login"
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT ${paginator.pageSize} OFFSET ${paginator.skip}`,
      params,
    );

    const commentsView = commentsRaw.map((comment) =>
      this.commentDBToCommentView(comment),
    );
    return paginator.paginate(totalCount, commentsView);
  }

  async getCommentViewById(
    id: IdTypes,
    userId?: IdTypes,
  ): Promise<ViewCommentDto | null> {
    const commentsRaw: CommentViewRawType[] = await this.dataSource.query(
      `SELECT "comments".*, 
        users."login" as "userLogin",
        COALESCE((SELECT "status" 
                    FROM public."CommentLikes" 
                 WHERE "commentId" = $1 and "userId" = $2), 
                'None') as "StatusMyLike",
        COALESCE("likes"."likesCount", 0) as "likesCount",
        COALESCE("likes"."dislikesCount", 0) as "dislikesCount"
      FROM public."Comments" as comments
        LEFT JOIN public."Users" as users
            ON comments."userId" = users."id"
        LEFT JOIN 
            (SELECT 
                "commentId", 
                SUM(CASE WHEN "status" = 'Like' 
                        THEN 1
                        ELSE 0
                    END
                ) as "likesCount", 
                SUM(
                    CASE WHEN "status" = 'Dislike' 
                        THEN 1
                        ELSE 0
                    END
                ) as "dislikesCount"
            FROM public."CommentLikes"
            WHERE "commentId" = $1
            GROUP BY "commentId") as "likes"
                ON comments."id" = "likes"."commentId"
      WHERE comments."id" = $1`,
      [+id, userId ? +userId : null],
    );

    if (!commentsRaw.length) return null;
    if (commentsRaw[0].isBanned) return null;

    return this.commentDBToCommentView(commentsRaw[0]);
  }

  commentDBToCommentView(comment: CommentViewRawType): ViewCommentDto {
    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId.toString(),
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: comment.StatusMyLike,
      },
    };
  }
}
