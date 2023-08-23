import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../entities/blog.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog) private readonly repository: Repository<Blog>,
  ) {}

  async findBlogById(id: number): Promise<Blog | null> {
    return this.repository.findOneBy({ id });
  }

  async save(blog: Blog) {
    await this.repository.save(blog);
  }

  async setBanUnbaneBlogByOwnerId(ownerId: number, isBanned: boolean) {
    const banDate = isBanned ? new Date() : null;
    await this.repository.update({ ownerId }, { isBanned, banDate });
  }
}
