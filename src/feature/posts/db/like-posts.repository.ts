import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostLike } from '../entities/post-like.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class LikePostsRepository {
  constructor(
    @InjectRepository(PostLike)
    private readonly postLikesRepo: Repository<PostLike>,
  ) {}

  async updateBanUnban(
    userId: number,
    isBanned: boolean,
    manager?: EntityManager,
  ) {
    if (manager) {
      await manager.update(PostLike, { userId }, { isBanned });
    } else {
      await this.postLikesRepo.update({ userId }, { isBanned });
    }
  }

  async findLikeByPostIdAndUserId(
    postId: number,
    userId: number,
  ): Promise<PostLike | null> {
    return this.postLikesRepo.findOneBy({ postId, userId });
  }

  async save(postLike: PostLike) {
    await this.postLikesRepo.save(postLike);
  }

  async createPostLike(postLike: PostLike): Promise<PostLike | null> {
    return this.postLikesRepo.save(postLike);
  }
}
