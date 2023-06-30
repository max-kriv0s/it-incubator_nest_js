import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { LikeStatus } from '../likes/dto/like-status';
import { CastToObjectId } from '../../utils';

export type LikePostsDocument = HydratedDocument<LikePosts>;

@Schema()
export class LikePosts {
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

  static createLikePosts(
    postId: string,
    userId: string,
    login: string,
    status: LikeStatus,
    LikePostsModel: LikePostsModelType,
  ): LikePostsDocument {
    const data = {
      postId: CastToObjectId(postId),
      userId: CastToObjectId(userId),
      login: login,
      addedAt: new Date(),
      status: status,
    };

    return new LikePostsModel(data);
  }
}

export const LikePostsSchema = SchemaFactory.createForClass(LikePosts);

LikePostsSchema.methods = {
  setStatus: LikePosts.prototype.setStatus,
  getStatus: LikePosts.prototype.getStatus,
};

export type LikePostsModelStaticType = {
  createLikePosts: (
    postId: string,
    userId: string,
    login: string,
    status: LikeStatus,
    LikePostsModel: LikePostsModelType,
  ) => LikePostsDocument;
};

const likePostsStatusMethods: LikePostsModelStaticType = {
  createLikePosts: LikePosts.createLikePosts,
};
LikePostsSchema.statics = likePostsStatusMethods;

export type LikePostsModelType = Model<LikePosts> & LikePostsModelStaticType;
