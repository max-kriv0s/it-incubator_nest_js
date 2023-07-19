import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { LikeStatus } from '../likes/dto/like-status';
import { castToObjectId } from '../../utils';
import { Comment } from './comment.schema';

export type LikeCommentsDocument = HydratedDocument<LikeComments>;

type CreateLike = {
  commentId: Types.ObjectId;
  userId: Types.ObjectId;
  status: LikeStatus;
};

@Schema()
export class LikeComments {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: Comment.name })
  commentId: Comment;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ default: false })
  userIsBanned: boolean;

  @Prop({ default: LikeStatus.None })
  status: LikeStatus;

  setStatus(newStatus: LikeStatus) {
    this.status = newStatus;
  }

  getStatus(): LikeStatus {
    return this.status;
  }

  static createLike(
    commentId: string,
    userId: string,
    status: LikeStatus,
    LikeModel: LikeCommentsModelType,
  ): LikeCommentsDocument {
    const data: CreateLike = {
      commentId: castToObjectId(commentId),
      userId: castToObjectId(userId),
      status: status,
    };

    return new LikeModel(data);
  }

  setUserIsBanned(value: boolean) {
    this.userIsBanned = value;
  }
}

export const LikeCommentsSchema = SchemaFactory.createForClass(LikeComments);

LikeCommentsSchema.methods = {
  setStatus: LikeComments.prototype.setStatus,
  getStatus: LikeComments.prototype.getStatus,
  setUserIsBanned: LikeComments.prototype.setUserIsBanned,
};

export type LikeCommentsModelStaticType = {
  createLike: (
    commentId: string,
    userId: string,
    status: LikeStatus,
    LikeModel: LikeCommentsModelType,
  ) => LikeCommentsDocument;
};

const likeCommentsStatusMethods: LikeCommentsModelStaticType = {
  createLike: LikeComments.createLike,
};
LikeCommentsSchema.statics = likeCommentsStatusMethods;

export type LikeCommentsModelType = Model<LikeComments> &
  LikeCommentsModelStaticType;
