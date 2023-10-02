import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post) private readonly postsRepo: Repository<Post>,
  ) {}

  async setBanUnbanePostsByBlogId(blogId: number, isBanned: boolean) {
    await this.postsRepo.update({ blogId }, { isBanned });
  }

  async createPostByBlogId(post: Post): Promise<Post> {
    return this.postsRepo.save(post);
  }

  async findPostById(id: number): Promise<Post | null> {
    return this.postsRepo.findOneBy({ id });
  }

  async save(post: Post) {
    await this.postsRepo.save(post);
  }

  async deletePostById(id: number): Promise<number | null | undefined> {
    const result = await this.postsRepo.delete({ id });
    return result.affected;
  }
}
