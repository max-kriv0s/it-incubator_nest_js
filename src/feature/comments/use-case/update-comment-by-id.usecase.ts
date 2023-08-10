import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { validateOrRejectModel } from '../../../modules/validation';
import { ResultCodeError, ResultNotification } from 'src/modules/notification';
import { CommentsSqlRepository } from '../db/comments.sql-repository';

export class UpdateCommentByIdCommand {
  constructor(
    public id: string,
    public commentDto: UpdateCommentDto,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentByIdCommand)
export class UpdateCommentByIdUseCase
  implements ICommandHandler<UpdateCommentByIdCommand>
{
  constructor(private readonly commentsSqlRepository: CommentsSqlRepository) {}
  async execute(
    command: UpdateCommentByIdCommand,
  ): Promise<ResultNotification> {
    await validateOrRejectModel(command.commentDto, UpdateCommentDto);

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

    await this.commentsSqlRepository.updateComment(
      command.id,
      command.commentDto,
    );
    return result;
  }
}
