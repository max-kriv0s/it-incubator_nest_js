import { Injectable } from '@nestjs/common';
import { BlogsRepository } from 'src/blogs/blogs.repository';

@Injectable()
export class TestingService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async deleteAllData() {
    return Promise.all([this.blogsRepository.deleteBlogs()]);
  }
}
