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
import { PostRawSqlDocument } from '../../../feature/posts/model/post-sql.model';

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
      WHERE NOT "isBanned"`,
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
      WHERE NOT "isBanned"`,
      [+blogId],
    );
    if (!blogsRaw.length) return null;

    const params = [+blogId];
    const postsCount = await this.dataSource.query(
      `SELECT count(*)
        FROM public."Posts"
        WHERE "blogId" = $1`,
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
    const postsView = postsRaw.map((post) => this.postDBToPostView(post));
    return paginator.paginate(totalCount, postsView);
  }

  private postDBToPostView(post: PostRawSqlDocument): ViewPostDto {
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
}
// async postDBToPostView(
//   post: PostDocument,
//   userId?: string,
// ): Promise<ViewPostDto> {
//   let statusMyLike = LikeStatus.None;

//   if (userId) {
//     const myLike = await this.LikePostsModel.findOne({
//       postId: post._id,
//       userId: castToObjectId(userId),
//     }).exec();
//     if (myLike) statusMyLike = myLike.status;
//   }

//   return {
//     id: post._id.toString(),
//     title: post.title,
//     shortDescription: post.shortDescription,
//     content: post.content,
//     blogId: post.blogId.toString(),
//     blogName: post.blogName,
//     createdAt: post.createdAt.toISOString(),
//     extendedLikesInfo: {
//       likesCount: post.likesCount,
//       dislikesCount: post.dislikesCount,
//       myStatus: statusMyLike,
//       newestLikes: await Promise.all(
//         post.newestLikes.map((like) => this.newestLikesToView(like)),
//       ),
//     },
//   };
// }

//   async newestLikesToView(like: NewestLikes): Promise<ViewLikeDetailsDto> {
//     return {
//       addedAt: like.addedAt.toISOString(),
//       userId: like.userId,
//       login: like.login,
//     };
//   }
// }
