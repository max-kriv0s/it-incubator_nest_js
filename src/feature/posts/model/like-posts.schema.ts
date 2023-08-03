import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { LikeStatus } from '../../likes/dto/like-status';
import { castToObjectId } from '../../../utils';

export type LikePostsDocument = HydratedDocument<LikePosts>;

@Schema()
export class LikePosts {
  _id: Types.ObjectId;

  @Prop({ required: true })
  postId: Types.ObjectId;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ default: false })
  userIsBanned: boolean;

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
      postId: castToObjectId(postId),
      userId: castToObjectId(userId),
      login: login,
      addedAt: new Date(),
      status: status,
    };

    return new LikePostsModel(data);
  }

  setUserIsBanned(value: boolean) {
    this.userIsBanned = value;
  }
}

export const LikePostsSchema = SchemaFactory.createForClass(LikePosts);

LikePostsSchema.methods = {
  setStatus: LikePosts.prototype.setStatus,
  getStatus: LikePosts.prototype.getStatus,
  setUserIsBanned: LikePosts.prototype.setUserIsBanned,
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
