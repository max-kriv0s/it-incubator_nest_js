import { Injectable } from '@nestjs/common';
import {
  BloggerBannedUsers,
  BloggerBannedUsersDocument,
  BloggerBannedUsersModelType,
} from '../model/blogger-banned-users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { castToObjectId } from 'src/utils';

@Injectable()
export class BloggersRepository {
  constructor(
    @InjectModel(BloggerBannedUsers.name)
    private BloggerBannedUsersModel: BloggerBannedUsersModelType,
  ) {}

  async findBannedUserByblogIdAndUserId(
    blogId: string,
    userId: string,
  ): Promise<BloggerBannedUsersDocument | null> {
    return this.BloggerBannedUsersModel.findOne({
      blogId: castToObjectId(blogId),
      bannedUserId: castToObjectId(userId),
    });
  }

  createBloggerBannedUsers(
    userId: string,
    userLogin: string,
    blogId: string,
  ): BloggerBannedUsersDocument {
    return this.BloggerBannedUsersModel.createBannedUser(
      userId,
      userLogin,
      blogId,
      this.BloggerBannedUsersModel,
    );
  }

  async save(
    bannedUser: BloggerBannedUsersDocument,
  ): Promise<BloggerBannedUsersDocument> {
    return bannedUser.save();
  }
}
