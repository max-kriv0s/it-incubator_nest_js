import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogs/blogs.repository';
import { CommetsRepository } from '../comments/comments.repository';
import { PostsRepository } from '../posts/posts.repository';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class TestingService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommetsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async deleteAllData() {
    return Promise.all([
      this.blogsRepository.deleteBlogs(),
      this.usersRepository.deleteUsers(),
      this.commentsRepository.deleteComments(),
      this.postsRepository.deletePosts(),
    ]);
  }
}
