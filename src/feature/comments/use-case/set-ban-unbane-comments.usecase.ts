import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../comments.repository';

export class SetBanUnbanCommentsCommand {
  constructor(public userId: string, public valueBan: boolean) {}
}

@CommandHandler(SetBanUnbanCommentsCommand)
export class SetBanUnbanCommentsUseCase
  implements ICommandHandler<SetBanUnbanCommentsCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: SetBanUnbanCommentsCommand): Promise<boolean> {
    const comments = await this.commentsRepository.findCommentsByUserId(
      command.userId,
    );
    if (!comments) return false;

    await Promise.all(
      comments.map((comment) => {
        comment.setBanUnbaneUser(command.valueBan);
        this.commentsRepository.save(comment);
      }),
    );

    return true;
  }
}
