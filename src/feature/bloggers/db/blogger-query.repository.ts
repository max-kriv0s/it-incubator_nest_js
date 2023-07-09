import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from '../../../feature/blogs/blog.schema';
import { BloggerQueryParams } from '../dto/blogger-query-params.dto';
import {
  PaginatorBloggerBlogView,
  PaginatorBloggerPostView,
  ViewBloggerBlogDto,
  ViewBloggerPostDto,
} from '../dto/view-blogger-blogs.dto';
import { castToObjectId } from 'src/utils';
import {
  NewestLikes,
  Post,
  PostDocument,
  PostModelType,
} from '../../../feature/posts/post.schema';
import { LikeStatus } from '../../../feature/likes/dto/like-status';
import {
  LikePosts,
  LikePostsModelType,
} from '../../../feature/posts/like-posts.schema';
import { ViewLikeDetailsDto } from '../../../feature/likes/dto/view-like.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';

@Injectable()
export class BloggerQueryRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(LikePosts.name) private LikePostsModel: LikePostsModelType,
  ) {}

  async getBlogs(
    queryParams: BloggerQueryParams,
    userId: string,
  ): Promise<PaginatorBloggerBlogView> {
    const searchNameTerm: string = queryParams.searchNameTerm ?? '';
    const pageNumber: number = queryParams.pageNumber
      ? +queryParams.pageNumber
      : 1;
    const pageSize: number = queryParams.pageSize ? +queryParams.pageSize : 10;
    const sortBy: string = queryParams.sortBy ?? 'createdAt';
    const sortDirection: string = queryParams.sortDirection ?? 'desc';
    const filter: any = { 'blogOwner.userId': castToObjectId(userId) };

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

  async getBlogById(id: string): Promise<ViewBloggerBlogDto | null> {
    const blog = await this.BlogModel.findById(id).exec();
    if (!blog) return null;

    return this.blogDBToBlogView(blog);
  }

  async blogDBToBlogView(blog: BlogDocument): Promise<ViewBloggerBlogDto> {
    return {
      id: blog._id.toString(),
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
    const post = await this.PostModel.findById(id).exec();
    if (!post) return null;

    return this.postDBToPostView(post, userId);
  }

  async postDBToPostView(
    post: PostDocument,
    userId: string,
  ): Promise<ViewBloggerPostDto> {
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

  async findPostsByBlogId(
    blogId: string,
    queryParams: BloggerQueryParams,
    userId: string,
  ): Promise<ResultNotification<PaginatorBloggerPostView>> {
    const pageNumber: number = +queryParams.pageNumber || 1;
    const pageSize: number = +queryParams.pageSize || 10;
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const result = new ResultNotification<PaginatorBloggerPostView>();

    const blog = await this.BlogModel.findById(blogId);
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }

    if (blog.blogOwner.userId.toString() !== userId) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    const filter = { blogId: blog._id };
    const totalCount: number = await this.PostModel.countDocuments(filter);

    const skip = (pageNumber - 1) * pageSize;
    const posts: PostDocument[] = await this.PostModel.find(filter, null, {
      sort: { [sortBy]: sortDirection === 'asc' ? 1 : -1 },
      skip: skip,
      limit: pageSize,
    }).exec();

    const postsView = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: await Promise.all(
        posts.map((post) => this.postDBToPostView(post, userId)),
      ),
    };
    result.addData(postsView);
    return result;
  }
}
