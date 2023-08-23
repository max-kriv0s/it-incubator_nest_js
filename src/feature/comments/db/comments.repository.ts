import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment) private readonly repository: Repository<Comment>,
  ) {}

  async updateBanUnban(userId: number, isBanned: boolean) {
    await this.repository.update({ userId }, { isBanned });
  }
}
