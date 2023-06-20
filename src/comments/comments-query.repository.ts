import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument, CommentModelType } from './comment.schema';
import { Types } from 'mongoose';
import { ViewCommentDto } from './dto/view-comment.dto';
import { ResultCode, ResultDto } from 'src/dto';
import { getResultDto, validID } from 'src/utils';
import { LikeStatus } from 'src/likes/dto/like-status';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

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
