import { Injectable } from '@nestjs/common';
import {
  PaginatorBlogSql,
  PaginatorBlogSqlType,
  ViewBlogDto,
} from '../dto/view-blog.dto';
import { QueryParams } from '../../../dto';
import {
  PaginatorPostSql,
  PaginatorPostView,
  ViewPostDto,
} from '../../posts/dto/view-post.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogRawSqlDocument } from '../model/blog-sql.model';
import { PostWithLikesRawSqlDocument } from '../../../feature/posts/model/post-sql.model';
import { SubscriptionStatuses } from '../entities/blog-subscribers.entity';

@Injectable()
export class BlogsQuerySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getBlogs(
    queryParams: QueryParams,
    paginator: PaginatorBlogSql,
  ): Promise<PaginatorBlogSqlType> {
    const searchNameTerm: string = queryParams.searchNameTerm ?? '';
    const sortBy: string = queryParams.sortBy ?? 'createdAt';
    const sortDirection: string = queryParams.sortDirection ?? 'desc';

    const params = [`%${searchNameTerm}%`];
    const blogsCount: { count: number }[] = await this.dataSource.query(
      `SELECT count(*)
      FROM public."Blogs"
      WHERE NOT "isBanned" AND "name" ILIKE $1`,
      params,
    );
    const totalCount = +blogsCount[0].count;
    const blogsRaw: BlogRawSqlDocument[] = await this.dataSource.query(
      `SELECT *
      FROM public."Blogs"
      WHERE NOT "isBanned" AND "name" ILIKE $1
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT ${paginator.pageSize} OFFSET ${paginator.skip}`,
      params,
    );

    const blogsView = blogsRaw.map((blog) => this.blogDBToBlogView(blog));
    return paginator.paginate(totalCount, blogsView);
  }

  async getBlogById(id: string): Promise<ViewBlogDto | null> {
    const blogsRaw: BlogRawSqlDocument[] = await this.dataSource.query(
      `SELECT *
      FROM public."Blogs"
      WHERE NOT "isBanned" AND "id" = $1`,
      [+id],
    );
    if (!blogsRaw.length) return null;
    return this.blogDBToBlogView(blogsRaw[0]);
  }

  private blogDBToBlogView(blog: BlogRawSqlDocument): ViewBlogDto {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
      images: { main: [], wallpaper: null },
      currentUserSubscriptionStatus: SubscriptionStatuses.None,
      subscribersCount: 0,
    };
  }

  async findPostsByBlogId(
    blogId: string,
    queryParams: QueryParams,
    paginator: PaginatorPostSql,
    userId?: string,
  ): Promise<PaginatorPostView | null> {
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const blogsRaw: BlogRawSqlDocument[] = await this.dataSource.query(
      `SELECT *
      FROM public."Blogs"
      WHERE NOT "isBanned" AND "id" = $1`,
      [+blogId],
    );
    if (!blogsRaw.length) return null;

    const params: [number | null] = [+blogId];
    const postsCount = await this.dataSource.query(
      `SELECT count(*)
        FROM public."Posts"
        WHERE "blogId" = $1`,
      params,
    );
    const totalCount: number = +postsCount[0].count;

    params.push(userId ? +userId : null);
    const postsRaw: PostWithLikesRawSqlDocument[] = await this.dataSource.query(
      `WITH posts_blog AS (
        SELECT *
        FROM public."Posts"
        WHERE "blogId" = $1 AND NOT "isBanned"
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
        SELECT *
        FROM (SELECT
            post_likes."postId" AS "postId",
            post_likes."addedAt" AS "addedAt",
            post_likes."userId" AS "userId",
            users."login" AS "login",
            ROW_NUMBER () OVER (PARTITION BY post_likes."postId" ORDER BY post_likes."addedAt" desc)
          FROM public."PostLikes" AS post_likes
          LEFT JOIN public."Users" AS users
            ON post_likes."userId" = users."id"
          WHERE 
            "postId" in (SELECT posts_blog."id" FROM posts_blog) AND 
            "status" = 'Like' AND NOT post_likes."isBanned"
          ORDER BY "addedAt" DESC) AS post_likes_limit 
        WHERE post_likes_limit.ROW_NUMBER <= 3
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
        ON posts_blog."blogId" = blogs."id" 
        ORDER BY posts_blog."${sortBy}" ${sortDirection}`,
      params,
    );
    const postsView = this.postsDBToPostsView(postsRaw);
    return paginator.paginate(totalCount, postsView);
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
          images: { main: [] },
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
