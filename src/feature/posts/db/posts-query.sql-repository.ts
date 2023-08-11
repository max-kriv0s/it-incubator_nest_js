import { Injectable } from '@nestjs/common';
import { QueryParams } from '../../../dto';
import {
  PaginatorPostSql,
  PaginatorPostSqlType,
  ViewPostDto,
} from '../dto/view-post.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostWithLikesRawSqlDocument } from '../model/post-sql.model';

@Injectable()
export class PostsQuerySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getPosts(
    queryParams: QueryParams,
    paginator: PaginatorPostSql,
    userId?: string,
  ): Promise<PaginatorPostSqlType> {
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const postsCount: { count: number }[] = await this.dataSource.query(
      `SELECT count(*)
        FROM public."Posts"
        WHERE NOT "isBanned"`,
    );

    const totalCount: number = +postsCount[0].count;

    const postsRaw: PostWithLikesRawSqlDocument[] = await this.dataSource.query(
      `WITH posts_blog AS (
        SELECT *
        FROM public."Posts"
        WHERE NOT "isBanned"
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${paginator.pageSize} OFFSET ${paginator.skip}
      ), likes_dislikes AS (
        SELECT
          "postId",
          SUM(CASE 
            WHEN "status" = 'Like' 
                    THEN 1
                  ELSE 0
              END) AS "likesCount",  
          SUM(CASE 
            WHEN "status" = 'Dislike' 
                    THEN 1
                  ELSE 0
              END) AS "dislikesCount"
        FROM public."PostLikes"
        WHERE "postId" in (SELECT posts_blog."id" FROM posts_blog) AND NOT "isBanned"
        GROUP BY "postId"
      ), newest_likes AS (
        SELECT
          post_likes."postId" AS "postId",
          post_likes."addedAt" AS "addedAt",
          post_likes."userId" AS "userId",
          users."login" AS "login"
        FROM public."PostLikes" AS post_likes
        LEFT JOIN public."Users" AS users
          ON post_likes."userId" = users."id"
        WHERE 
          "postId" in (SELECT posts_blog."id" FROM posts_blog) AND 
          "status" = 'Like' AND NOT post_likes."isBanned"
        ORDER BY "addedAt" DESC 
        LIMIT 3
      )
      SELECT 
        posts_blog.*,
        blogs."name" AS "blogName",
        COALESCE(
          (SELECT "status"
          FROM public."PostLikes"
          WHERE "postId" = posts_blog."id" AND "userId" = $1)
          , 'None') AS "myStatusLike",
        COALESCE(likes_dislikes."likesCount", 0) AS "likesCount",
        COALESCE(likes_dislikes."dislikesCount", 0) AS "dislikesCount",
        newest_likes."addedAt" AS "addedAt",
        newest_likes."userId" AS "userId",
        newest_likes."login" AS "login"
      FROM posts_blog
      LEFT JOIN likes_dislikes
        ON posts_blog."id" = likes_dislikes."postId"
      LEFT JOIN newest_likes
        ON posts_blog."id" = newest_likes."postId"
      LEFT JOIN public."Blogs" AS blogs
        ON posts_blog."blogId" = blogs."id"
        ORDER BY posts_blog."${sortBy}" ${sortDirection}, newest_likes."addedAt" DESC`,
      [userId ? +userId : null],
    );
    const postsView = this.postsDBToPostsView(postsRaw);
    return paginator.paginate(totalCount, postsView);
  }

  async getPostById(id: string, userId?: string): Promise<ViewPostDto | null> {
    const postsRaw: PostWithLikesRawSqlDocument[] = await this.dataSource.query(
      `WITH posts_blog AS (
        SELECT *
        FROM public."Posts"
        WHERE "id" = $1
      ), likes_dislikes AS (
        SELECT
          "postId",
          SUM(CASE 
            WHEN "status" = 'Like' 
                    THEN 1
                  ELSE 0
              END) AS "likesCount",  
          SUM(CASE 
            WHEN "status" = 'Dislike' 
                    THEN 1
                  ELSE 0
              END) AS "dislikesCount"
        FROM public."PostLikes"
        WHERE "postId" in (SELECT posts_blog."id" FROM posts_blog) AND NOT "isBanned"
        GROUP BY "postId"
      ), newest_likes AS (
        SELECT
          post_likes."postId" AS "postId",
          post_likes."addedAt" AS "addedAt",
          post_likes."userId" AS "userId",
          users."login" AS "login"
        FROM public."PostLikes" AS post_likes
        LEFT JOIN public."Users" AS users
          ON post_likes."userId" = users."id"
        WHERE 
          "postId" in (SELECT posts_blog."id" FROM posts_blog) AND 
          "status" = 'Like' AND NOT post_likes."isBanned"
        ORDER BY "addedAt" DESC 
        LIMIT 3
      )
      SELECT 
        posts_blog.*,
        blogs."name" AS "blogName",
        COALESCE(
          (SELECT "status"
          FROM public."PostLikes"
          WHERE "postId" = posts_blog."id" AND "userId" = $2)
          , 'None') AS "myStatusLike",
        COALESCE(likes_dislikes."likesCount", 0) AS "likesCount",
        COALESCE(likes_dislikes."dislikesCount", 0) AS "dislikesCount",
        newest_likes."addedAt" AS "addedAt",
        newest_likes."userId" AS "userId",
        newest_likes."login" AS "login"
      FROM posts_blog
      LEFT JOIN likes_dislikes
        ON posts_blog."id" = likes_dislikes."postId"
      LEFT JOIN newest_likes
        ON posts_blog."id" = newest_likes."postId"
      LEFT JOIN public."Blogs" AS blogs
        ON posts_blog."blogId" = blogs."id" `,
      [+id, userId ? +userId : null],
    );
    if (!postsRaw.length) return null;
    const postsView = this.postsDBToPostsView(postsRaw);
    return postsView[0];
  }

  private postsDBToPostsView(
    postsRaw: PostWithLikesRawSqlDocument[],
  ): ViewPostDto[] {
    const result: ViewPostDto[] = [];
    const addedPosts = {};

    for (const postRaw of postsRaw) {
      let post: ViewPostDto = addedPosts[postRaw.id];
      if (!post) {
        post = {
          id: postRaw.id.toString(),
          title: postRaw.title,
          shortDescription: postRaw.shortDescription,
          content: postRaw.content,
          blogId: postRaw.blogId.toString(),
          blogName: postRaw.blogName,
          createdAt: postRaw.createdAt.toISOString(),
          extendedLikesInfo: {
            likesCount: +postRaw.likesCount,
            dislikesCount: +postRaw.dislikesCount,
            myStatus: postRaw.myStatusLike,
            newestLikes: [],
          },
        };
        result.push(post);
        addedPosts[postRaw.id] = post;
      }

      if (postRaw.userId) {
        post.extendedLikesInfo.newestLikes.push({
          addedAt: postRaw.addedAt.toISOString(),
          userId: postRaw.userId.toString(),
          login: postRaw.login,
        });
      }
    }

    return result;
  }
}
