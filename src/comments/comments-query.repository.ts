import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument, CommentModelType } from './comment.schema';
import { Types } from 'mongoose';
import { PaginatorCommentView, ViewCommentDto } from './dto/view-comment.dto';
import { QueryParams, ResultCode, ResultDto } from 'src/dto';
import { getResultDto, validID } from '../utils';
import { LikeStatus } from 'src/likes/dto/like-status';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async findCommentsByPostId(
    postId: string,
    queryParams: QueryParams,
    userId?: string,
  ): Promise<PaginatorCommentView | null> {
    if (!validID(postId)) return null;

    const pageNumber: number = +queryParams.pageNumber || 1;
    const pageSize: number = +queryParams.pageSize || 10;
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const filter = { postId: postId };
    const totalCount: number = await this.CommentModel.countDocuments(filter);

    const skip = (pageNumber - 1) * pageSize;
    const comments = await this.CommentModel.find(filter, null, {
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
        comments.map((comment) => this.commentDBToCommentView(comment, userId)),
      ),
    };
  }

  async getCommentViewById(
    id: Types.ObjectId | string,
    userId?: string,
  ): Promise<ResultDto<ViewCommentDto>> {
    if (typeof id === 'string' && !validID(id)) {
      return getResultDto<ViewCommentDto>(
        ResultCode.ServerError,
        null,
        'incorrect value id',
      );
    }

    const comment = await this.CommentModel.findById(id).exec();
    if (!comment) {
      return getResultDto<ViewCommentDto>(
        ResultCode.NotFound,
        null,
        'Comment not found',
      );
    }

    const commentView = await this.commentDBToCommentView(comment, userId);
    return getResultDto<ViewCommentDto>(ResultCode.Success, commentView);
  }

  async commentDBToCommentView(
    comment: CommentDocument,
    userId?: string,
  ): Promise<ViewCommentDto> {
    const statusMyLike = LikeStatus.None;

    if (userId && validID(userId)) {
      //   const myLike = await LikeModel.findOne({
      //     commentId: comment._id,
      //     userId: userId,
      //   }).exec();
      //   if (myLike) statusMyLike = myLike.status;
    }

    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId.toString(),
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: statusMyLike,
      },
    };
  }
}
