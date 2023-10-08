import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentLike } from '../entities/comment-likes.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class LikeCommentsRepository {
  constructor(
    @InjectRepository(CommentLike)
    private readonly commentLikeRepo: Repository<CommentLike>,
  ) {}

  async updateBanUnban(
    userId: number,
    isBanned: boolean,
    manager?: EntityManager,
  ) {
    if (manager) {
      await manager.update(CommentLike, { userId }, { isBanned });
    } else {
      await this.commentLikeRepo.update({ userId }, { isBanned });
    }
  }

  async findLikeByCommentIdAndUserId(
    commentId: number,
    userId: number,
  ): Promise<CommentLike | null> {
    return this.commentLikeRepo.findOneBy({ commentId, userId });
  }

  async save(commentLike: CommentLike) {
    await this.commentLikeRepo.save(commentLike);
  }

  async createCommentLike(commentLike: CommentLike): Promise<CommentLike> {
    return this.commentLikeRepo.save(commentLike);
  }
}
