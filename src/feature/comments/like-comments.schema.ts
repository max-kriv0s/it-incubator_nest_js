import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { LikeStatus } from '../likes/dto/like-status';
import { CastToObjectId } from '../../utils';

export type LikeCommentsDocument = HydratedDocument<LikeComments>;

type CreateLike = {
  commentId: Types.ObjectId;
  userId: Types.ObjectId;
  status: LikeStatus;
};

@Schema()
export class LikeComments {
  _id: Types.ObjectId;

  @Prop({ required: true })
  commentId: Types.ObjectId;

  @Prop({ required: true })
  userId: Types.ObjectId;

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
      commentId: CastToObjectId(commentId),
      userId: CastToObjectId(userId),
      status: status,
    };

    return new LikeModel(data);
  }
}

export const LikeCommentsSchema = SchemaFactory.createForClass(LikeComments);

LikeCommentsSchema.methods = {
  setStatus: LikeComments.prototype.setStatus,
  getStatus: LikeComments.prototype.getStatus,
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
