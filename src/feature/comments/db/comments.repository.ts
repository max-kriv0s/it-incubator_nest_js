import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
  ) {}

  async updateBanUnban(userId: number, isBanned: boolean) {
    await this.commentsRepo.update({ userId }, { isBanned });
  }

  async findCommentById(id: number): Promise<Comment | null> {
    return this.commentsRepo.findOneBy({ id });
  }

  async save(comment: Comment) {
    await this.commentsRepo.save(comment);
  }

  async deleteCommentById(id: number) {
    await this.commentsRepo.delete({ id });
  }

  async createCommentByPostId(comment: Comment): Promise<Comment> {
    return this.commentsRepo.save(comment);
  }
}
