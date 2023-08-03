import { Injectable } from '@nestjs/common';
import { QueryParams } from '../../../dto';
import {
  PaginatorPostSql,
  PaginatorPostSqlType,
  ViewPostDto,
} from '../dto/view-post.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostRawSqlDocument } from '../model/post-sql.model';

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
      WHERE NOT posts."isBanned"
      ORDER BY posts."${sortBy}" ${sortDirection}
      LIMIT ${paginator.pageSize} OFFSET ${paginator.skip}`,
    );

    const postsView = postsRaw.map((post) =>
      this.postDBToPostView(post, userId),
    );
    return paginator.paginate(totalCount, postsView);
  }

  // async findPostsByBlogId(
  //   blogId: string,
  //   queryParams: QueryParams,
  //   userId?: string,
  // ): Promise<PaginatorPostView | null> {
  //   const pageNumber: number = +queryParams.pageNumber || 1;
  //   const pageSize: number = +queryParams.pageSize || 10;
  //   const sortBy: string = queryParams.sortBy || 'createdAt';
  //   const sortDirection = queryParams.sortDirection || 'desc';

  //   const blog = await this.BlogModel.findById(blogId);
  //   if (!blog) return null;

  //   const filter = { blogId: blog._id };
  //   const totalCount: number = await this.PostModel.countDocuments(filter);

  //   const skip = (pageNumber - 1) * pageSize;
  //   const posts: PostDocument[] = await this.PostModel.find(filter, null, {
  //     sort: { [sortBy]: sortDirection === 'asc' ? 1 : -1 },
  //     skip: skip,
  //     limit: pageSize,
  //   }).exec();

  //   return {
  //     pagesCount: Math.ceil(totalCount / pageSize),
  //     page: pageNumber,
  //     pageSize: pageSize,
  //     totalCount: totalCount,
  //     items: await Promise.all(
  //       posts.map((post) => this.postDBToPostView(post, userId)),
  //     ),
  //   };
  // }

  async getPostById(id: string, userId?: string): Promise<ViewPostDto | null> {
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
      WHERE NOT posts."isBanned" AND posts."id" = $1`,
      [+id],
    );

    if (!postsRaw.length) return null;

    return this.postDBToPostView(postsRaw[0], userId);
  }

  private postDBToPostView(
    post: PostRawSqlDocument,
    userId?: string,
  ): ViewPostDto {
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

  // async newestLikesToView(like: NewestLikes): Promise<ViewLikeDetailsDto> {
  //   return {
  //     addedAt: like.addedAt.toISOString(),
  //     userId: like.userId,
  //     login: like.login,
  //   };
  // }
}
