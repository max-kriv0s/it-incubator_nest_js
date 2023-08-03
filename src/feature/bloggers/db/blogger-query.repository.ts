import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from '../../blogs/model/blog.schema';
import { BloggerQueryParams } from '../dto/blogger-query-params.dto';
import {
  PaginatorBloggerBlogView,
  PaginatorBloggerPostView,
  ViewBloggerBlogDto,
  ViewBloggerPostDto,
} from '../dto/view-blogger-blogs.dto';
import { castToObjectId } from '../../../utils';
import {
  NewestLikes,
  Post,
  PostDocument,
  PostModelType,
} from '../../posts/model/post.schema';
import { LikeStatus } from '../../../feature/likes/dto/like-status';
import {
  LikePosts,
  LikePostsModelType,
} from '../../posts/model/like-posts.schema';
import { ViewLikeDetailsDto } from '../../../feature/likes/dto/view-like.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../../../feature/comments/comment.schema';
import {
  PaginatorViewBloggerCommentsDto,
  ViewBloggerCommentsDto,
} from '../dto/view-blogger-comments.dto';
import { LikeCommentsService } from '../../../feature/comments/like-comments.service';
import { BloggerBannedUsersQueryParams } from '../dto/blogger-banned-users-query-param.dto';
import { PaginatorViewBloggerBannedUsersDto } from '../dto/view-blogger-banned-users.dto';
import {
  BloggerBannedUsers,
  BloggerBannedUsersDocument,
  BloggerBannedUsersModelType,
} from '../model/blogger-banned-users.schema';
import { User, UserModelType } from '../../users/model/user.schema';

@Injectable()
export class BloggerQueryRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(LikePosts.name) private LikePostsModel: LikePostsModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(BloggerBannedUsers.name)
    private BloggerBannedUsersModel: BloggerBannedUsersModelType,
    private readonly likeCommentsService: LikeCommentsService,
    @InjectModel(User.name) private UserModel: UserModelType,
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

  async allCommentsForAllPostsInsideBlogs(
    queryParams: BloggerQueryParams,
    userId: string,
  ): Promise<PaginatorViewBloggerCommentsDto> {
    const pageNumber: number = +queryParams.pageNumber || 1;
    const pageSize: number = +queryParams.pageSize || 10;
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const blogs = await this.BlogModel.find(
      { 'blogOwner.userId': castToObjectId(userId) },
      '_id',
    ).lean();
    const blogsFilter = blogs.map((blog) => blog._id);

    const posts = await this.PostModel.find(
      { blogId: { $in: blogsFilter } },
      '_id',
    ).lean();
    const postsFilter = posts.map((post) => post._id);

    const filter = { postId: { $in: postsFilter } };
    const totalCount: number = await this.CommentModel.countDocuments(filter);
    const skip = (pageNumber - 1) * pageSize;
    const comments = await this.CommentModel.find(filter, null, {
      sort: { [sortBy]: sortDirection === 'asc' ? 1 : -1 },
      skip: skip,
      limit: pageSize,
    }).populate('postId', '_id title blogId blogName', this.PostModel);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: await Promise.all(
        comments.map((comment) => this.commentToCommentView(comment, userId)),
      ),
    };
  }

  private async commentToCommentView(
    comment: CommentDocument,
    userId: string,
  ): Promise<ViewBloggerCommentsDto> {
    let statusMyLike = LikeStatus.None;

    if (userId) {
      const myLike =
        await this.likeCommentsService.findLikeByCommentIdAndUserId(
          comment.id,
          userId,
        );
      if (myLike) statusMyLike = myLike.status;
    }

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId.toString(),
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: statusMyLike,
      },
      postInfo: {
        id: comment.postId._id.toString(),
        title: comment.postId.title,
        blogId: comment.postId.blogId.toString(),
        blogName: comment.postId.blogName,
      },
    };
  }

  async getAllBannedUsersForBlog(
    blogId: string,
    userId: string,
    queryParams: BloggerBannedUsersQueryParams,
  ): Promise<ResultNotification<PaginatorViewBloggerBannedUsersDto>> {
    const searchLoginTerm: string = queryParams.searchLoginTerm ?? '';
    const pageNumber: number = queryParams.pageNumber
      ? +queryParams.pageNumber
      : 1;
    const pageSize: number = queryParams.pageSize ? +queryParams.pageSize : 10;
    let sortBy: string = queryParams.sortBy ?? 'createdAt';
    const sortDirection: string = queryParams.sortDirection ?? 'desc';

    if (sortBy.toLowerCase() === 'login') sortBy = 'bannedUserLogin';

    const result = new ResultNotification<PaginatorViewBloggerBannedUsersDto>();

    const blog = await this.BlogModel.findById({
      // const blog = await this.BlogModel.findOne({
      _id: castToObjectId(blogId),
      // 'blogOwner.userId': castToObjectId(userId),
    });
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }
    if (blog.blogOwner.userId.toString() !== userId) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    if (blog.isBanned) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    const isBannedUser =
      (await this.UserModel.countDocuments({
        _id: castToObjectId(userId),
        'banInfo.isBanned': true,
      })) > 0;
    if (isBannedUser) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    const filter: any = { blogId: castToObjectId(blogId), isBanned: true };

    if (searchLoginTerm) {
      filter.bannedUserLogin = { $regex: searchLoginTerm, $options: 'i' };
    }

    const totalCount = await this.BloggerBannedUsersModel.countDocuments(
      filter,
    );
    const skip = (pageNumber - 1) * pageSize;

    const bannedUsers: BloggerBannedUsersDocument[] =
      await this.BloggerBannedUsersModel.find(filter, null, {
        sort: { [sortBy]: sortDirection === 'asc' ? 1 : -1 },
        skip: skip,
        limit: pageSize,
      });

    const paginationResult: PaginatorViewBloggerBannedUsersDto = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: bannedUsers.map((user) => ({
        id: user.bannedUserId.toString(),
        login: user.bannedUserLogin,
        banInfo: {
          isBanned: user.isBanned,
          banDate: user.banDate ? user.banDate.toISOString() : user.banDate,
          banReason: user.banReason,
        },
      })),
    };
    result.addData(paginationResult);

    return result;
  }
}
