import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { BloggerBanUserInputDto } from '../dto/blogger-ban-user-input.dto';
import { castToObjectId } from '../../../utils';

export type BloggerBannedUsersDocument = HydratedDocument<BloggerBannedUsers>;

@Schema()
export class BloggerBannedUsers {
  _id: Types.ObjectId;

  @Prop({ required: true })
  blogId: Types.ObjectId;

  @Prop({ required: true })
  bannedUserId: Types.ObjectId;

  @Prop({ required: true })
  bannedUserLogin: string;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ type: Date || null, default: null })
  banDate: Date | null;

  @Prop({ type: String || null, default: null })
  banReason: string | null;

  static createBannedUser(
    userId: string,
    userLogin: string,
    blogId: string,
    BloggerBannedUsersModel: BloggerBannedUsersModelType,
  ): BloggerBannedUsersDocument {
    return new BloggerBannedUsersModel({
      blogId: castToObjectId(blogId),
      bannedUserId: castToObjectId(userId),
      bannedUserLogin: userLogin,
    });
  }

  updateBannedUser(banUserInputDto: BloggerBanUserInputDto) {
    this.isBanned = banUserInputDto.isBanned;
    this.banDate = banUserInputDto.isBanned ? new Date() : null;
    this.banReason = banUserInputDto.isBanned
      ? banUserInputDto.banReason
      : null;
  }
}

export const BloggerBannedUsersSchema =
  SchemaFactory.createForClass(BloggerBannedUsers);

BloggerBannedUsersSchema.methods = {
  updateBannedUser: BloggerBannedUsers.prototype.updateBannedUser,
};

export type BloggerBannedUsersModelStaticType = {
  createBannedUser: (
    userId: string,
    userLogin: string,
    blogId: string,
    BloggerBannedUsersModel: BloggerBannedUsersModelType,
  ) => BloggerBannedUsersDocument;
};
const bloggerBannedUsersStaticMethods: BloggerBannedUsersModelStaticType = {
  createBannedUser: BloggerBannedUsers.createBannedUser,
};

BloggerBannedUsersSchema.statics = bloggerBannedUsersStaticMethods;

export type BloggerBannedUsersModelType = Model<BloggerBannedUsers> &
  BloggerBannedUsersModelStaticType;
