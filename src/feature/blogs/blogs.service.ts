import { Injectable } from '@nestjs/common';
import { BlogsRepository } from './db/blogs.repository';
import { BlogDocument } from './model/blog.schema';
import { BlogSqlDocument } from './model/blog-sql.model';
import { BlogsSqlRepository } from './db/blogs.sql-repository';

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
}
