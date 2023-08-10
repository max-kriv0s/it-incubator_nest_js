import { Injectable } from '@nestjs/common';
import {
  NewestLikes,
  Post,
  PostDocument,
  PostModelType,
} from '../model/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { QueryParams } from '../../../dto';
import { PaginatorPostView, ViewPostDto } from '../dto/view-post.dto';
import { LikeStatus } from '../../likes/dto/like-status';
import { Blog, BlogModelType } from '../../blogs/model/blog.schema';
import { LikePosts, LikePostsModelType } from '../model/like-posts.schema';
import { castToObjectId } from '../../../utils';
import { ViewLikeDetailsDto } from '../../likes/dto/view-like.dto';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(LikePosts.name) private LikePostsModel: LikePostsModelType,
  ) {}

  async getPosts(
    queryParams: QueryParams,
    userId?: string,
  ): Promise<PaginatorPostView> {
    const pageNumber: number = +queryParams.pageNumber || 1;
    const pageSize: number = +queryParams.pageSize || 10;
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const filter = { isBanned: { $ne: true } };

    const totalCount: number = await this.PostModel.countDocuments(filter);
    const skip = (pageNumber - 1) * pageSize;
    const posts: PostDocument[] = await this.PostModel.find(filter, null, {
      sort: { [sortBy]: sortDirection === 'asc' ? 1 : -1 },
      skip: skip,
      limit: pageSize,
    }).exec();

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: await Promise.all(
        posts.map((post) => this.postDBToPostView(post, userId)),
      ),
    };
  }

  async findPostsByBlogId(
    blogId: string,
    queryParams: QueryParams,
    userId?: string,
  ): Promise<PaginatorPostView | null> {
    const pageNumber: number = +queryParams.pageNumber || 1;
    const pageSize: number = +queryParams.pageSize || 10;
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const blog = await this.BlogModel.findById(blogId);
    if (!blog) return null;

    const filter = { blogId: blog._id };
    const totalCount: number = await this.PostModel.countDocuments(filter);

    const skip = (pageNumber - 1) * pageSize;
    const posts: PostDocument[] = await this.PostModel.find(filter, null, {
      sort: { [sortBy]: sortDirection === 'asc' ? 1 : -1 },
      skip: skip,
      limit: pageSize,
    }).exec();

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: await Promise.all(
        posts.map((post) => this.postDBToPostView(post, userId)),
      ),
    };
  }

  async getPostById(id: string, userId?: string): Promise<ViewPostDto | null> {
    const post = await this.PostModel.findOne({
      _id: castToObjectId(id),
      isBanned: { $ne: true },
    });
    if (!post) return null;

    return this.postDBToPostView(post, userId);
  }

  async postDBToPostView(
    post: PostDocument,
    userId?: string,
  ): Promise<ViewPostDto> {
    let statusMyLike = LikeStatus.None;

    if (userId) {
      const myLike = await this.LikePostsModel.findOne({
        postId: post._id,
        userId: castToObjectId(userId),
      }).exec();
      if (myLike) statusMyLike = myLike.status;
    }

    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: statusMyLike,
        newestLikes: await Promise.all(
          post.newestLikes.map((like) => this.newestLikesToView(like)),
        ),
      },
    };
  }

  async newestLikesToView(like: NewestLikes): Promise<ViewLikeDetailsDto> {
    return {
      addedAt: like.addedAt.toISOString(),
      userId: like.userId,
      login: like.login,
    };
  }
}