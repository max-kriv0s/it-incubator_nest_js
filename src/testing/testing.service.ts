import { Injectable } from '@nestjs/common';
import { BlogsRepository } from 'src/blogs/blogs.repository';
import { CommetsRepository } from 'src/comments/comments.repository';
import { PostsRepository } from 'src/posts/posts.repository';
import { UsersRepository } from 'src/users/users.repository';

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
