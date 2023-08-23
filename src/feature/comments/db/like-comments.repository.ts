import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentLike } from '../entities/comment-likes.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LikeCommentsRepository {
  constructor(
    @InjectRepository(CommentLike)
    private readonly repository: Repository<CommentLike>,
  ) {}

  async updateBanUnban(userId: number, isBanned: boolean) {
    await this.repository.update({ userId }, { isBanned });
  }
}
