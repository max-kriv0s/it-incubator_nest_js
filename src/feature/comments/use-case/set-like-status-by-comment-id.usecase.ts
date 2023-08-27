import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../feature/likes/dto/like-status';
import { CommentsRepository } from '../db/comments.repository';
import { LikeCommentsRepository } from '../db/like-comments.repository';
import { CommentLike } from '../entities/comment-likes.entity';

export class SetLikeStatusByCommentIdCommand {
  constructor(
    public commentId: number,
    public userId: number,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(SetLikeStatusByCommentIdCommand)
export class SetLikeStatusByCommentIdUseCase
  implements ICommandHandler<SetLikeStatusByCommentIdCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly likeCommentsRepository: LikeCommentsRepository,
  ) {}

  async execute(command: SetLikeStatusByCommentIdCommand): Promise<boolean> {
    const comment = await this.commentsRepository.findCommentById(
      command.commentId,
    );
    if (!comment) return false;

    const like = await this.likeCommentsRepository.findLikeByCommentIdAndUserId(
      command.commentId,
      command.userId,
    );

    if (like) {
      like.status = command.likeStatus;
      await this.likeCommentsRepository.save(like);
    } else {
      const newLike = new CommentLike();
      newLike.commentId = command.commentId;
      newLike.userId = command.userId;
      newLike.status = command.likeStatus;
      await this.likeCommentsRepository.createCommentLike(newLike);
    }
    return true;
  }
}
