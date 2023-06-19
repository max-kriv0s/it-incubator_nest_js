import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BlogsRepository } from 'src/blogs/blogs.repository';

@Injectable()
export class TestingService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async deleteAllData() {
    try {
      return Promise.all([this.blogsRepository.deleteBlogs()]);
    } catch (error) {
      throw new HttpException(
        `error delete all-data: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
