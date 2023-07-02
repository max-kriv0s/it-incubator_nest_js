import { Injectable } from '@nestjs/common';
import {
  LikePosts,
  LikePostsDocument,
  LikePostsModelType,
} from './like-posts.schema';
import { CastToObjectId } from '../../utils';
import { InjectModel } from '@nestjs/mongoose';
import { LikeStatus } from '../likes/dto/like-status';
import { ViewLikeDetailsDto } from '../likes/dto/view-like.dto';
import { NewestLikes } from './post.schema';

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
      postId: CastToObjectId(postId),
      userId: CastToObjectId(userId),
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
      { postId: CastToObjectId(postId), status: LikeStatus.Like },
      ['addedAt', 'userId', 'login', '-_id'],
      {
        sort: { addedAt: -1 },
        limit: 3,
      },
    ).lean();
  }

  async deletePostLikes() {
    await this.LikePostsModel.deleteMany({});
  }

  async save(likePosts: LikePostsDocument) {
    return likePosts.save();
  }
}
