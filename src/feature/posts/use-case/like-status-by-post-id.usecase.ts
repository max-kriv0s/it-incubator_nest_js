import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from '../db/posts.sql-repository';
import { UsersSqlRepository } from 'src/feature/users/db/users.sql-repository';
import { LikePostsSqlRepository } from '../db/like-posts.sql-repository';
import { LikeStatus } from 'src/feature/likes/dto/like-status';

export class LikeStatusByPostIdCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(LikeStatusByPostIdCommand)
export class LikeStatusByPostIdUseCase
  implements ICommandHandler<LikeStatusByPostIdCommand>
{
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly likePostsSqlRepository: LikePostsSqlRepository,
  ) {}

  async execute(command: LikeStatusByPostIdCommand): Promise<boolean> {
    const post = await this.postsSqlRepository.findPostById(command.postId);
    if (!post) return false;

    const user = await this.usersSqlRepository.findUserById(command.userId);
    if (!user) return false;

    const like = await this.likePostsSqlRepository.findLikeByPostIdAndUserId(
      command.postId,
      command.userId,
    );

    if (like) {
      await this.likePostsSqlRepository.updateLike(like.id, command.likeStatus);
    } else {
      await this.likePostsSqlRepository.createLike(
        command.postId,
        command.userId,
        command.likeStatus,
      );
    }

    return true;
  }
}
