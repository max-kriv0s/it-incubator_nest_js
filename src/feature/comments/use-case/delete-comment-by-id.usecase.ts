import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { CommentsRepository } from '../db/comments.repository';

export class DeleteCommentbyIdCommand {
  constructor(public id: number, public userId: number) {}
}

@CommandHandler(DeleteCommentbyIdCommand)
export class DeleteCommentbyIdUseCase
  implements ICommandHandler<DeleteCommentbyIdCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(
    command: DeleteCommentbyIdCommand,
  ): Promise<ResultNotification> {
    const result = new ResultNotification();

    const comment = await this.commentsRepository.findCommentById(command.id);
    if (!comment) {
      result.addError('Comment not found', ResultCodeError.NotFound);
      return result;
    }
    if (comment.userId !== command.userId) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    await this.commentsRepository.deleteCommentById(command.id);
    return result;
  }
}
