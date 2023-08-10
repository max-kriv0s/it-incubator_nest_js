import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { CommentsSqlRepository } from '../db/comments.sql-repository';

export class DeleteCommentbyIdCommand {
  constructor(public id: string, public userId: string) {}
}

@CommandHandler(DeleteCommentbyIdCommand)
export class DeleteCommentbyIdUseCase
  implements ICommandHandler<DeleteCommentbyIdCommand>
{
  constructor(private readonly commentsSqlRepository: CommentsSqlRepository) {}

  async execute(
    command: DeleteCommentbyIdCommand,
  ): Promise<ResultNotification> {
    const result = new ResultNotification();

    const comment = await this.commentsSqlRepository.findCommentByID(
      command.id,
    );
    if (!comment) {
      result.addError('Comment not found', ResultCodeError.NotFound);
      return result;
    }

    if (comment.userId !== command.userId) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    await this.commentsSqlRepository.deleteCommentByID(command.id);
    return result;
  }
}
