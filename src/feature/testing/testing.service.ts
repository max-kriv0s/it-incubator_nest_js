import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogs/blogs.repository';
import { CommentsRepository } from '../comments/comments.repository';
import { PostsRepository } from '../posts/posts.repository';
import { UsersRepository } from '../users/users.repository';
import { SecurityDevicesRepository } from '../security-devices/security-devices.repository';
import { LikePostsRepository } from '../posts/like-posts.repository';
import { ApiCallsRepository } from '../api-calls/api-calls.repository';

@Injectable()
export class TestingService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly likePostsRepository: LikePostsRepository,
    private readonly apiCallsRepository: ApiCallsRepository,
  ) {}

  async deleteAllData() {
    return Promise.all([
      this.blogsRepository.deleteBlogs(),
      this.usersRepository.deleteUsers(),
      this.commentsRepository.deleteComments(),
      this.postsRepository.deletePosts(),
      this.securityDevicesRepository.deleteSecurityDevices(),
      this.likePostsRepository.deletePostLikes(),
      this.apiCallsRepository.deleteCalls(),
    ]);
  }
}
