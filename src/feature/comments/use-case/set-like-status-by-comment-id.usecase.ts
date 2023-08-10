import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../feature/likes/dto/like-status';
import { CommentsSqlRepository } from '../db/comments.sql-repository';
import { LikeCommentsSqlRepository } from '../db/like-comments.sql-repository';

export class SetLikeStatusByCommentIdCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(SetLikeStatusByCommentIdCommand)
export class SetLikeStatusByCommentIdUseCase
  implements ICommandHandler<SetLikeStatusByCommentIdCommand>
{
  constructor(
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly likeCommentsSqlRepository: LikeCommentsSqlRepository,
  ) {}

  async execute(command: SetLikeStatusByCommentIdCommand): Promise<boolean> {
    const comment = await this.commentsSqlRepository.findCommentByID(
      command.commentId,
    );
    if (!comment) return false;

    const like =
      await this.likeCommentsSqlRepository.findLikeByCommentIdAndUserId(
        command.commentId,
        command.userId,
      );

    if (like) {
      await this.likeCommentsSqlRepository.updateLike(
        like.id,
        command.likeStatus,
      );
    } else {
      await this.likeCommentsSqlRepository.createLike(
        command.commentId,
        command.userId,
        command.likeStatus,
      );
    }
    return true;
  }
}
