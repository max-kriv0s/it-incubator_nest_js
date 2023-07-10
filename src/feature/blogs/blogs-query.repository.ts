import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from './blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { PaginatorBlogView, ViewBlogDto } from './dto/view-blog.dto';
import { QueryParams } from '../../dto';
import { PaginatorPostView, ViewPostDto } from '../posts/dto/view-post.dto';
import {
  NewestLikes,
  Post,
  PostDocument,
  PostModelType,
} from '../posts/post.schema';
import { LikeStatus } from '../likes/dto/like-status';
import { castToObjectId } from '../../utils';
import { ViewLikeDetailsDto } from '../likes/dto/view-like.dto';
import { LikePosts, LikePostsModelType } from '../posts/like-posts.schema';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(LikePosts.name) private LikePostsModel: LikePostsModelType,
  ) {}

  async getBlogs(queryParams: QueryParams): Promise<PaginatorBlogView> {
    const searchNameTerm: string = queryParams.searchNameTerm ?? '';
    const pageNumber: number = queryParams.pageNumber
      ? +queryParams.pageNumber
      : 1;
    const pageSize: number = queryParams.pageSize ? +queryParams.pageSize : 10;
    const sortBy: string = queryParams.sortBy ?? 'createdAt';
    const sortDirection: string = queryParams.sortDirection ?? 'desc';
    const filter: any = { 'blogOwner.isBanned': false };

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }

    const totalCount: number = await this.BlogModel.countDocuments(filter);
    const skip = (pageNumber - 1) * pageSize;
    const blogs: BlogDocument[] = await this.BlogModel.find(filter, null, {
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
        blogs.map((blog) => this.blogDBToBlogView(blog)),
      ),
    };
  }

  async getBlogById(id: string): Promise<ViewBlogDto | null> {
    const blog = await this.BlogModel.findById(id).exec();
    if (!blog) return null;
    if (blog.blogOwner.isBanned) return null;

    return this.blogDBToBlogView(blog);
  }

  async blogDBToBlogView(blog: BlogDocument): Promise<ViewBlogDto> {
    return {
      id: blog._id.toString(),
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
    userId?: string,
  ): Promise<PaginatorPostView | null> {
    const pageNumber: number = +queryParams.pageNumber || 1;
    const pageSize: number = +queryParams.pageSize || 10;
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const blog = await this.BlogModel.findById(blogId);
    if (!blog) return null;
    if (blog.blogOwner.isBanned) return null;

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
