import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { LikeStatus } from '../likes/dto/like-status';

export type CommentLikeDocument = HydratedDocument<CommentLike>;

@Schema()
export class CommentLike {
  _id: Types.ObjectId;

  @Prop({ required: true })
  commentId: Types.ObjectId;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ default: LikeStatus.None })
  status: LikeStatus;
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);

export type CommentLikeModelType = Model<CommentLike>;
