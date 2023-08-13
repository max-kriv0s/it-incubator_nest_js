import { Injectable } from '@nestjs/common';
import { UsersSqlRepository } from '../users/db/users.sql-repository';
import { SecurityDevicesSqlRepository } from '../security-devices/db/security-devices.sql-repository';
import { BlogsSqlRepository } from '../blogs/db/blogs.sql-repository';
import { PostsSqlRepository } from '../posts/db/posts.sql-repository';
import { BloggersSqlRepository } from '../bloggers/db/bloggers.sql-repository';
import { CommentsSqlRepository } from '../comments/db/comments.sql-repository';
import { LikePostsSqlRepository } from '../posts/db/like-posts.sql-repository';
import { LikeCommentsSqlRepository } from '../comments/db/like-comments.sql-repository';

@Injectable()
export class TestingService {
  constructor(
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
    private readonly likePostsSqlRepository: LikePostsSqlRepository,
    private readonly likeCommentsSqlRepository: LikeCommentsSqlRepository,
    private readonly bloggersSqlRepository: BloggersSqlRepository,
  ) {}

  async deleteAllData() {
    return Promise.all([
      this.blogsSqlRepository.deleteBlogs(),
      this.usersSqlRepository.deleteUsers(),
      this.commentsSqlRepository.deleteComments(),
      this.postsSqlRepository.deletePosts(),
      this.securityDevicesSqlRepository.deleteSecurityDevices(),
      this.likePostsSqlRepository.deleteLikesPosts(),
      this.likeCommentsSqlRepository.deleteLikesComments(),
      this.bloggersSqlRepository.deleteBloggerBannedUsers(),
    ]);
  }
}
