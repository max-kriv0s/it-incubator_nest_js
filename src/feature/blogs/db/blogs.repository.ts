import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../entities/blog.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog) private readonly blogsRepo: Repository<Blog>,
  ) {}

  async findBlogById(id: number): Promise<Blog | null> {
    return this.blogsRepo.findOneBy({ id });
  }

  async createBlog(blog: Blog): Promise<Blog> {
    return this.blogsRepo.save(blog);
  }

  async save(blog: Blog) {
    await this.blogsRepo.save(blog);
  }

  async setBanUnbaneBlogByOwnerId(ownerId: number, isBanned: boolean) {
    const banDate = isBanned ? new Date() : null;
    await this.blogsRepo.update({ ownerId }, { isBanned, banDate });
  }

  async deleteBlogById(id: number) {
    await this.blogsRepo.delete(id);
  }
}
