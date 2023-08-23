import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post) private readonly repository: Repository<Post>,
  ) {}

  async setBanUnbanePostsByBlogId(blogId: number, isBanned: boolean) {
    await this.repository.update({ blogId }, { isBanned });
  }
}
