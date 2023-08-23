import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostLike } from '../entities/post-like.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LikePostsRepository {
  constructor(
    @InjectRepository(PostLike)
    private readonly repository: Repository<PostLike>,
  ) {}

  async updateBanUnban(userId: number, isBanned: boolean) {
    await this.repository.update({ userId }, { isBanned });
  }
}
