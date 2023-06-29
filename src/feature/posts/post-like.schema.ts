import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { LikeStatus } from '../likes/dto/like-status';
import { CastToObjectId } from '../../utils';

export type PostLikeDocument = HydratedDocument<PostLike>;

@Schema()
export class PostLike {
  _id: Types.ObjectId;

  @Prop({ required: true })
  postId: Types.ObjectId;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  addedAt: Date;

  @Prop({ default: LikeStatus.None })
  status: LikeStatus;

  setStatus(newStatus: LikeStatus) {
    this.status = newStatus;
  }

  getStatus(): LikeStatus {
    return this.status;
  }

  static createPostLike(
    postId: string,
    userId: string,
    login: string,
    status: LikeStatus,
    PostLikeModel: PostLikeModelType,
  ): PostLikeDocument {
    const data = {
      postId: CastToObjectId(postId),
      userId: CastToObjectId(userId),
      login: login,
      addedAt: new Date(),
      status: status,
    };

    return new PostLikeModel(data);
  }
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

PostLikeSchema.methods = {
  setStatus: PostLike.prototype.setStatus,
  getStatus: PostLike.prototype.getStatus,
};

export type PostLikeModelStaticType = {
  createPostLike: (
    postId: string,
    userId: string,
    login: string,
    status: LikeStatus,
    PostLikeModel: PostLikeModelType,
  ) => PostLikeDocument;
};

const postLikeStatusMethods: PostLikeModelStaticType = {
  createPostLike: PostLike.createPostLike,
};
PostLikeSchema.statics = postLikeStatusMethods;

export type PostLikeModelType = Model<PostLike> & PostLikeModelStaticType;
