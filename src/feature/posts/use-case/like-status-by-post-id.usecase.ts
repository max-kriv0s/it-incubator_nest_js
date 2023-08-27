import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../feature/likes/dto/like-status';
import { PostsRepository } from '../db/posts.repository';
import { UsersRepository } from '../../../feature/users/db/users.repository';
import { LikePostsRepository } from '../db/like-posts.repository';
import { PostLike } from '../entities/post-like.entity';

export class LikeStatusByPostIdCommand {
  constructor(
    public postId: number,
    public userId: number,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(LikeStatusByPostIdCommand)
export class LikeStatusByPostIdUseCase
  implements ICommandHandler<LikeStatusByPostIdCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly likePostsRepository: LikePostsRepository,
  ) {}

  async execute(command: LikeStatusByPostIdCommand): Promise<boolean> {
    const post = await this.postsRepository.findPostById(command.postId);
    if (!post) return false;

    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) return false;

    const like = await this.likePostsRepository.findLikeByPostIdAndUserId(
      command.postId,
      command.userId,
    );

    if (like) {
      like.status = command.likeStatus;
      await this.likePostsRepository.save(like);
    } else {
      const newPostLike = new PostLike();
      newPostLike.postId = command.postId;
      newPostLike.userId = command.userId;
      newPostLike.status = command.likeStatus;
      await this.likePostsRepository.createPostLike(newPostLike);
    }

    return true;
  }
}
