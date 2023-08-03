import { Injectable } from '@nestjs/common';
import { BlogsRepository } from './db/blogs.repository';
import { BlogDocument } from './model/blog.schema';
import { BlogsSqlRepository } from './db/blogs.sql-repository';
import { BlogSqlDocument } from './model/blog-sql.model';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async deleteBlogById(id: string) {
    return this.blogsRepository.deleteBlogById(id);
  }

  async findBlogById(id: string): Promise<string | null> {
    const blog = await this.blogsRepository.findBlogById(id);
    return blog ? blog.id : null;
  }

  async findBlogModelById(id: string): Promise<BlogDocument | null> {
    return await this.blogsRepository.findBlogById(id);
  }

  async setBanUnbaneBlogByOwnerId(ownerId: string, isBanned: boolean) {
    return this.blogsSqlRepository.setBanUnbaneBlogByOwnerId(ownerId, isBanned);
  }
}
