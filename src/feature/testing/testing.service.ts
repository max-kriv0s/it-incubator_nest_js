import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../comments/comments.repository';
import { LikePostsRepository } from '../posts/db/like-posts.repository';
import { ApiCallsRepository } from '../api-calls/api-calls.repository';
import { LikeCommentsRepository } from '../comments/like-comments.repository';
import { UsersSqlRepository } from '../users/db/users.sql-repository';
import { SecurityDevicesSqlRepository } from '../security-devices/db/security-devices.sql-repository';
import { BlogsSqlRepository } from '../blogs/db/blogs.sql-repository';
import { PostsSqlRepository } from '../posts/db/posts.sql-repository';
import { BloggersSqlRepository } from '../bloggers/db/bloggers.sql-repository';

@Injectable()
export class TestingService {
  constructor(
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
    private readonly likePostsRepository: LikePostsRepository,
    private readonly likeCommentsRepository: LikeCommentsRepository,
    private readonly apiCallsRepository: ApiCallsRepository,
    private readonly bloggersSqlRepository: BloggersSqlRepository,
  ) {}

  async deleteAllData() {
    return Promise.all([
      this.blogsSqlRepository.deleteBlogs(),
      this.usersSqlRepository.deleteUsers(),
      this.commentsRepository.deleteComments(),
      this.postsSqlRepository.deletePosts(),
      this.securityDevicesSqlRepository.deleteSecurityDevices(),
      this.likePostsRepository.deleteLikesPosts(),
      this.likeCommentsRepository.deleteLikesComments(),
      this.apiCallsRepository.deleteCalls(),
      this.bloggersSqlRepository.deleteBloggerBannedUsers(),
    ]);
  }
}
