import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class CommentatorInfo {
  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userLogin: string;
}

@Schema()
export class Comment {
  _id: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop()
  commentatorInfo: CommentatorInfo;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  postId: Types.ObjectId;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  dislikesCount: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

export type CommentModelType = Model<Comment>;
