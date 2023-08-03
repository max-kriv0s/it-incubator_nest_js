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
import {
  PostRawSqlDocument,
  PostSqlDocument,
  convertPostRawSqlToSqlDocument,
} from '../../../feature/posts/model/post-sql.model';
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
    };
  }

  async getPostById(
    id: string,
    userId: string,
  ): Promise<ViewBloggerPostDto | null> {
    const postsRaw: PostRawSqlDocument[] = await this.dataSource.query(
      `SELECT 
        posts.*, 
        blogs."name" as "blogName", 
        0 as "likesCount", 
        0 as "dislikesCount",
        'None' as "myStatusLike"
      FROM public."Posts" as posts
      LEFT JOIN public."Blogs" as blogs
        ON blogs."id" = posts."blogId"
      WHERE posts."id" = $1`,
      [+id],
    );
    if (!postsRaw.length) return null;
    const post = convertPostRawSqlToSqlDocument(postsRaw[0]);
    return this.postDBToPostView(post);
  }

  postDBToPostView(post: PostSqlDocument): ViewBloggerPostDto {
    // let statusMyLike = LikeStatus.None;

    // if (userId) {
    //   const myLike = await this.LikePostsModel.findOne({
    //     postId: post._id,
    //     userId: castToObjectId(userId),
    //   }).exec();
    //   if (myLike) statusMyLike = myLike.status;
    // }

    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: post.myStatusLike,
        newestLikes: [],
      },
    };
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
        WHERE "id" = $1`,
      params,
    );

    const totalCount: number = +postsCount[0].count;
    const postsRaw: PostRawSqlDocument[] = await this.dataSource.query(
      `SELECT 
        posts.*, 
        blogs."name" as "blogName", 
        0 as "likesCount", 
        0 as "dislikesCount",
        'None' as "myStatusLike"
      FROM public."Posts" as posts
      LEFT JOIN public."Blogs" as blogs
        ON blogs."id" = posts."blogId"
      WHERE posts."blogId" = $1
      ORDER BY posts."${sortBy}" ${sortDirection}
      LIMIT ${paginator.pageSize} OFFSET ${paginator.skip}`,
      params,
    );
    const posts = postsRaw.map((post) => convertPostRawSqlToSqlDocument(post));
    const postsView = posts.map((post) => this.postDBToPostView(post));
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
      `SELECT *`,
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
}
