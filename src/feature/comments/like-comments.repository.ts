import { Injectable } from '@nestjs/common';
import {
  LikeComments,
  LikeCommentsDocument,
  LikeCommentsModelType,
} from './like-comments.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CastToObjectId } from 'src/utils';
import { LikeStatus } from '../likes/dto/like-status';

@Injectable()
export class LikeCommentsRepository {
  constructor(
    @InjectModel(LikeComments.name)
    private LikeCommentsModel: LikeCommentsModelType,
  ) {}

  async findLikeByCommentIdAndUserId(
    commentId: string,
    userId: string,
  ): Promise<LikeCommentsDocument | null> {
    return this.LikeCommentsModel.findOne({
      commentId: CastToObjectId(commentId),
      userId: CastToObjectId(userId),
    }).exec();
  }

  createLike(commentId: string, userId: string, status: LikeStatus) {
    return this.LikeCommentsModel.createLike(
      commentId,
      userId,
      status,
      this.LikeCommentsModel,
    );
  }

  async deleteLikesComments() {
    await this.LikeCommentsModel.deleteMany({});
  }

  async save(like: LikeCommentsDocument) {
    return like.save();
  }
}
