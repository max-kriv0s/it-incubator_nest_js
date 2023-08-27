import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { validateOrRejectModel } from '../../../modules/validation';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { CommentsRepository } from '../db/comments.repository';

export class UpdateCommentByIdCommand {
  constructor(
    public id: number,
    public commentDto: UpdateCommentDto,
    public userId: number,
  ) {}
}

@CommandHandler(UpdateCommentByIdCommand)
export class UpdateCommentByIdUseCase
  implements ICommandHandler<UpdateCommentByIdCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}
  async execute(
    command: UpdateCommentByIdCommand,
  ): Promise<ResultNotification> {
    await validateOrRejectModel(command.commentDto, UpdateCommentDto);

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

    comment.content = command.commentDto.content;
    await this.commentsRepository.save(comment);

    return result;
  }
}
