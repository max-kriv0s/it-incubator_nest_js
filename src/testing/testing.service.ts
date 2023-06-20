import { Injectable } from '@nestjs/common';
import { BlogsRepository } from 'src/blogs/blogs.repository';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class TestingService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async deleteAllData() {
    return Promise.all([
      this.blogsRepository.deleteBlogs(),
      this.usersRepository.deleteUsers(),
    ]);
  }
}
