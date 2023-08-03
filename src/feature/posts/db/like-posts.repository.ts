import { Injectable } from '@nestjs/common';
import {
  LikePosts,
  LikePostsDocument,
  LikePostsModelType,
} from '../model/like-posts.schema';
import { castToObjectId } from '../../../utils';
import { InjectModel } from '@nestjs/mongoose';
import { LikeStatus } from '../../likes/dto/like-status';
import { NewestLikes } from '../model/post.schema';

@Injectable()
export class LikePostsRepository {
  constructor(
    @InjectModel(LikePosts.name) private LikePostsModel: LikePostsModelType,
  ) {}

  async findLikeByPostIdAndUserId(
    postId: string,
    userId: string,
  ): Promise<LikePostsDocument | null> {
    return this.LikePostsModel.findOne({
      postId: castToObjectId(postId),
      userId: castToObjectId(userId),
    }).exec();
  }

  createLikePosts(
    postId: string,
    userId: string,
    login: string,
    likeStatus: LikeStatus,
  ) {
    return this.LikePostsModel.createLikePosts(
      postId,
      userId,
      login,
      likeStatus,
      this.LikePostsModel,
    );
  }

  async getNewestLikes(postId: string): Promise<NewestLikes[]> {
    return this.LikePostsModel.find(
      {
        postId: castToObjectId(postId),
        status: LikeStatus.Like,
        userIsBanned: false,
      },
      ['addedAt', 'userId', 'login', '-_id'],
      {
        sort: { addedAt: -1 },
        limit: 3,
      },
    ).lean();
  }

  async deleteLikesPosts() {
    await this.LikePostsModel.deleteMany({});
  }

  async save(likePosts: LikePostsDocument) {
    return likePosts.save();
  }

  async findLikesByUserId(userId: string) {
    return this.LikePostsModel.find({ userId: castToObjectId(userId) });
  }
}
