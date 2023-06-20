import { Injectable } from '@nestjs/common';
import { Post, PostDocument, PostModelType } from './post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { QueryParams, ResultCode, ResultDto } from 'src/dto';
import { PaginatorPostView, ViewPostDto } from './dto/view-post.dto';
import { getResultDto, validID } from 'src/utils';
import { LikeStatus } from 'src/likes/dto/like-status';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async getPosts(
    queryParams: QueryParams,
    userId?: string,
  ): Promise<PaginatorPostView> {
    const pageNumber: number = +queryParams.pageNumber || 1;
    const pageSize: number = +queryParams.pageSize || 10;
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const totalCount: number = await this.PostModel.countDocuments({});
    const skip = (pageNumber - 1) * pageSize;
    const posts: PostDocument[] = await this.PostModel.find({}, null, {
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

  async getPostById(
    id: Types.ObjectId | string,
    userId?: string,
  ): Promise<ResultDto<ViewPostDto>> {
    if (typeof id === 'string' && !validID(id)) {
      return getResultDto<ViewPostDto>(
        ResultCode.ServerError,
        null,
        'incorrect value id',
      );
    }

    const post = await this.PostModel.findById(id).exec();
    if (!post) {
      return getResultDto<ViewPostDto>(
        ResultCode.NotFound,
        null,
        'Post not found',
      );
    }

    const postView = await this.postDBToPostView(post, userId);
    return getResultDto<ViewPostDto>(ResultCode.Success, postView);
  }

  async postDBToPostView(
    post: PostDocument,
    userId?: string,
  ): Promise<ViewPostDto> {
    const statusMyLike = LikeStatus.None;

    if (userId && validID(userId)) {
      //   const myLike = await LikePostModel.findOne({
      //     postId: post._id,
      //     userId: userId,
      //   }).exec();
      //   if (myLike) statusMyLike = myLike.status;
    }

    // это можно хранить в постах, пересчитывая при изменении лайка
    const newestLikes = [];
    // const newestLikes: LikeDetailsViewModel[] = await LikePostModel.find(
    //   { postId: post._id, status: LikeStatus.Like },
    //   ['addedAt', 'userId', 'login', '-_id'],
    //   {
    //     sort: { addedAt: -1 },
    //     limit: 3,
    //   },
    // ).lean();

    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: statusMyLike,
        newestLikes: newestLikes,
      },
    };
  }
}
