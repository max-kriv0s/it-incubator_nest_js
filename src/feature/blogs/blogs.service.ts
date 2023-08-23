import { Injectable } from '@nestjs/common';
import { BlogsSqlRepository } from './db/blogs.sql-repository';
import { BlogSqlDocument } from './model/blog-sql.model';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async findBlogSqlById(id: string): Promise<BlogSqlDocument | null> {
    return this.blogsSqlRepository.findBlogById(id);
  }

}
