import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  PaginatorBloggerBlogSql,
  PaginatorBloggerBlogSqlViewType,
  PaginatorBloggerPostSql,
  PaginatorBloggerpostSqlViewType,
  ViewBloggerBlogDto,
  ViewBloggerPostDto,
} from '../dto/view-blogger-blogs.dto';
import { BlogRawSqlDocument } from '../../../feature/blogs/model/blog-sql.model';
import { BloggerQueryParams } from '../dto/blogger-query-params.dto';
import { PostWithLikesRawSqlDocument } from '../../../feature/posts/model/post-sql.model';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { BloggerBannedUsersQueryParams } from '../dto/blogger-banned-users-query-param.dto';
import {
  PaginatorViewBloggerBannedUsersSql,
  PaginatorViewBloggerBannedUsersSqlType,
  ViewBloggerBannedUsersDto,
} from '../dto/view-blogger-banned-users.dto';
import { BloggerQueryBannedUsersRawSqlDocument } from '../model/blogger-banned-users-sql.model';
import {
  PaginatorViewBloggerCommentsDto,
  ViewBloggerCommentsDto,
} from '../dto/view-blogger-comments.dto';
import { IPaginator } from '../../../dto';
import { CommentForPostRawSqlDocument } from '../../../feature/comments/model/comment-sql.model';
import { SubscriptionStatuses } from '../../../feature/blogs/entities/blog-subscribers.entity';

@Injectable()
export class BloggerQuerySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getBlogs(
    queryParams: BloggerQueryParams,
    userId: string,
    paginator: PaginatorBloggerBlogSql,
  ): Promise<PaginatorBloggerBlogSqlViewType> {
    const searchNameTerm: string = queryParams.searchNameTerm ?? '';
    const sortBy: string = queryParams.sortBy ?? 'createdAt';
    const sortDirection: string = queryParams.sortDirection ?? 'desc';

    const params = [+userId, `%${searchNameTerm}%`];
    const blogsCount: { count: number }[] = await this.dataSource.query(
      `SELECT count(*)
        FROM public."Blogs"
        WHERE "ownerId" = $1 AND "name" ILIKE $2`,
      params,
    );

    const totalCount = +blogsCount[0].count;
    const blogs: BlogRawSqlDocument[] = await this.dataSource.query(
      `SELECT *
        FROM public."Blogs"
        WHERE "ownerId" = $1 AND "name" ILIKE $2
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${paginator.pageSize} OFFSET ${paginator.skip}`,
      params,
    );
    const blogsView = blogs.map((blog) => this.blogDBToBlogView(blog));
    return paginator.paginate(totalCount, blogsView);
  }

  async getBlogById(id: string): Promise<ViewBloggerBlogDto | null> {
    const blogs: BlogRawSqlDocument[] = await this.dataSource.query(
      `SELECT *
        FROM public."Blogs"
        WHERE id = $1`,
      [+id],
    );
    if (!blogs.length) return null;
    return this.blogDBToBlogView(blogs[0]);
  }

  blogDBToBlogView(blog: BlogRawSqlDocument): ViewBloggerBlogDto {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
      images: {
        wallpaper: null,
        main: [],
      },
      currentUserSubscriptionStatus: SubscriptionStatuses.None,
      subscribersCount: 0,
    };
  }

  async getPostById(
    id: string,
    userId: string,
  ): Promise<ViewBloggerPostDto | null> {
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
          "status" = 'Like'
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
      [+id, +userId],
    );
    if (!postsRaw.length) return null;
    const postsView = this.postsDBToPostsView(postsRaw);
    return postsView[0];
  }

  private postsDBToPostsView(
    postsRaw: PostWithLikesRawSqlDocument[],
  ): ViewBloggerPostDto[] {
    const result: ViewBloggerPostDto[] = [];
    const addedPosts = {};

    for (const postRaw of postsRaw) {
      let post: ViewBloggerPostDto = addedPosts[postRaw.id];
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
          images: {
            main: [],
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

  async findPostsByBlogId(
    blogId: string,
    queryParams: BloggerQueryParams,
    userId: string,
    paginator: PaginatorBloggerPostSql,
  ): Promise<ResultNotification<PaginatorBloggerpostSqlViewType>> {
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const result = new ResultNotification<PaginatorBloggerpostSqlViewType>();

    const blogs = await this.dataSource.query(
      `SELECT "id", "ownerId"
      FROM public."Blogs"
      WHERE "id" = $1`,
      [+blogId],
    );

    if (!blogs.length) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }

    const blog = blogs[0];
    if (blog.ownerId.toString() !== userId) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    const params = [+blogId];
    const postsCount: { count: number }[] = await this.dataSource.query(
      `SELECT count(*)
        FROM public."Posts"
        WHERE "blogId" = $1`,
      params,
    );

    const totalCount: number = +postsCount[0].count;

    params.push(+userId);
    const postsRaw: PostWithLikesRawSqlDocument[] = await this.dataSource.query(
      `WITH posts_blog AS (
        SELECT *
        FROM public."Posts"
        WHERE "blogId" = $1
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
          "status" = 'Like'
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
      params,
    );
    const postsView = this.postsDBToPostsView(postsRaw);
    const postsViewPagination = paginator.paginate(totalCount, postsView);
    result.addData(postsViewPagination);
    return result;
  }

  async getAllBannedUsersForBlog(
    blogId: string,
    userId: string,
    queryParams: BloggerBannedUsersQueryParams,
    paginator: PaginatorViewBloggerBannedUsersSql,
  ): Promise<ResultNotification<PaginatorViewBloggerBannedUsersSqlType>> {
    const searchLoginTerm: string = queryParams.searchLoginTerm ?? '';
    const sortBy: string = queryParams.sortBy ?? 'createdAt';
    const sortDirection: string = queryParams.sortDirection ?? 'desc';

    // if (sortBy.toLowerCase() === 'login') sortBy = 'bannedUserLogin';

    const result =
      new ResultNotification<PaginatorViewBloggerBannedUsersSqlType>();

    const blogsRaw: BlogRawSqlDocument[] = await this.dataSource.query(
      `SELECT "id", "ownerId", "isBanned"
      FROM public."Blogs"
      WHERE "id" = $1`,
      [+blogId],
    );

    if (!blogsRaw.length) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }
    if (blogsRaw[0].ownerId.toString() !== userId) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    if (blogsRaw[0].isBanned) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    // const isBannedUser =
    //   (await this.UserModel.countDocuments({
    //     _id: castToObjectId(userId),
    //     'banInfo.isBanned': true,
    //   })) > 0;
    // if (isBannedUser) {
    //   result.addError('Access is denied', ResultCodeError.Forbidden);
    //   return result;
    // }

    const params = [+blogId, `%${searchLoginTerm}%`];
    const bannedUsersCount: { count: number }[] = await this.dataSource.query(
      `SELECT count(*)
      FROM public."BloggerBannedUsers" as "bannedUsers"
      LEFT JOIN public."Users" as users
        ON "bannedUsers"."bannedUserId" = users."id"
      WHERE "bannedUsers"."blogId" = $1 AND "bannedUsers"."isBanned"
        AND users."login" ILIKE $2`,
      params,
    );

    const totalCount = +bannedUsersCount[0].count;

    const bannedUsers: BloggerQueryBannedUsersRawSqlDocument[] =
      await this.dataSource.query(
        `SELECT "bannedUsers".*, users."login" as "bannedUserLogin"
        FROM public."BloggerBannedUsers" as "bannedUsers"
          LEFT JOIN public."Users" as users
            ON "bannedUsers"."bannedUserId" = users."id"
        WHERE "bannedUsers"."blogId" = $1 AND "bannedUsers"."isBanned"
          AND users."login" ILIKE $2
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${paginator.pageSize} OFFSET ${paginator.skip}`,
        params,
      );

    const bannedUsersView: ViewBloggerBannedUsersDto[] = bannedUsers.map(
      (bannedUser) => ({
        id: bannedUser.bannedUserId.toString(),
        login: bannedUser.bannedUserLogin,
        banInfo: {
          isBanned: bannedUser.isBanned,
          banDate: bannedUser.banDate
            ? bannedUser.banDate.toISOString()
            : bannedUser.banDate,
          banReason: bannedUser.banReason,
        },
      }),
    );

    const paginateView = paginator.paginate(totalCount, bannedUsersView);
    result.addData(paginateView);
    return result;
  }

  async allCommentsForAllPostsInsideBlogs(
    queryParams: BloggerQueryParams,
    userId: string,
    paginator: IPaginator<ViewBloggerCommentsDto>,
  ): Promise<PaginatorViewBloggerCommentsDto> {
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const params = [+userId];
    const commentCount: { count: number }[] = await this.dataSource.query(
      `WITH blogs AS (
        SELECT "id"
        FROM public."Blogs"
        WHERE "ownerId" = $1
      ), posts AS (
        SELECT "id"
        FROM public."Posts"
        WHERE "blogId" IN (SELECT "id" FROM blogs)
      ) 
      SELECT count(*)
      FROM public."Comments"
      WHERE "postId" IN (SELECT "id" FROM posts)
      `,
      params,
    );

    const totalCount: number = +commentCount[0].count;
    const commentsRaw: CommentForPostRawSqlDocument[] =
      await this.dataSource.query(
        `WITH blogs AS (
        SELECT "id", "name"
        FROM public."Blogs"
        WHERE "ownerId" = $1
      ), posts AS (
        SELECT "id", "blogId", "title"
        FROM public."Posts"
        WHERE "blogId" IN (SELECT "id" FROM blogs)
      ), comments AS (
        SELECT "id", "postId", "userId", "content", "createdAt"
        FROM public."Comments" AS comments
        WHERE "postId" IN (SELECT "id" FROM posts)
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${paginator.pageSize} OFFSET ${paginator.skip}
      ), likes_dislikes AS (
        SELECT
          "commentId",
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
        FROM public."CommentLikes"
        WHERE "commentId" in (SELECT "id" FROM comments) AND NOT "isBanned"
        GROUP BY "commentId"
      )
    SELECT 
      comments.*,
      COALESCE(likes_dislikes."likesCount", 0) AS "likesCount",
      COALESCE(likes_dislikes."dislikesCount", 0) AS "dislikesCount",
      COALESCE(
        (SELECT "status"
        FROM public."CommentLikes"
        WHERE "commentId" = comments."id" AND "userId" = $1)
        , 'None') AS "myStatus",
        users."login" AS "userLogin",
        posts."title",
        posts."blogId",
        blogs."name" AS "blogName"
    FROM comments
    LEFT JOIN likes_dislikes
      ON comments."id" = likes_dislikes."commentId"
    LEFT JOIN public."Users" AS users
      ON comments."userId" = users."id"
    LEFT JOIN posts
      ON comments."postId" = posts."id"
    LEFT JOIN blogs
      ON posts."blogId" = blogs."id"
      ORDER BY comments."${sortBy}" ${sortDirection}
      `,
        params,
      );

    const commentsView = commentsRaw.map((comment) =>
      this.commentToCommentView(comment),
    );
    return paginator.paginate(totalCount, commentsView);
  }

  private commentToCommentView(
    comment: CommentForPostRawSqlDocument,
  ): ViewBloggerCommentsDto {
    return {
      id: comment.id.toString(),
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      commentatorInfo: {
        userId: comment.userId.toString(),
        userLogin: comment.userLogin,
      },
      likesInfo: {
        likesCount: +comment.likesCount,
        dislikesCount: +comment.dislikesCount,
        myStatus: comment.myStatus,
      },
      postInfo: {
        blogId: comment.blogId.toString(),
        blogName: comment.blogName,
        title: comment.title,
        id: comment.postId.toString(),
      },
    };
  }
}
