import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../blogs/blogs.repository';
import { CommentsRepository } from '../comments/comments.repository';
import { PostsRepository } from '../posts/posts.repository';
import { LikePostsRepository } from '../posts/like-posts.repository';
import { ApiCallsRepository } from '../api-calls/api-calls.repository';
import { LikeCommentsRepository } from '../comments/like-comments.repository';
import { BloggersRepository } from '../bloggers/db/bloggers.repository';
import { UsersSqlRepository } from '../users/db/users.sql-repository';
import { SecurityDevicesSqlRepository } from '../security-devices/db/security-devices.sql-repository';

@Injectable()
export class TestingService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
    private readonly likePostsRepository: LikePostsRepository,
    private readonly likeCommentsRepository: LikeCommentsRepository,
    private readonly apiCallsRepository: ApiCallsRepository,
    private readonly bloggersRepository: BloggersRepository,
  ) {}

  async deleteAllData() {
    return Promise.all([
      this.blogsRepository.deleteBlogs(),
      this.usersSqlRepository.deleteUsers(),
      this.commentsRepository.deleteComments(),
      this.postsRepository.deletePosts(),
      this.securityDevicesSqlRepository.deleteSecurityDevices(),
      this.likePostsRepository.deleteLikesPosts(),
      this.likeCommentsRepository.deleteLikesComments(),
      this.apiCallsRepository.deleteCalls(),
      this.bloggersRepository.deleteBloggerBannedUsers(),
    ]);
  }
}
