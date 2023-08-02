import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { BlogsSqlRepository } from '../db/blogs.sql-repository';

export class DeleteBlogByIdCommand {
  constructor(public id: string, public userId: string) {}
}

@CommandHandler(DeleteBlogByIdCommand)
export class DeleteBlogByIdUseCase
  implements ICommandHandler<DeleteBlogByIdCommand>
{
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: DeleteBlogByIdCommand): Promise<ResultNotification> {
    const deletionResult = new ResultNotification();

    const blog = await this.blogsSqlRepository.findBlogById(command.id);
    if (!blog) {
      deletionResult.addError('Blog not found', ResultCodeError.NotFound);
      return deletionResult;
    }

    if (blog.ownerId !== command.userId) {
      deletionResult.addError('Access is denied', ResultCodeError.Forbidden);
      return deletionResult;
    }

    await this.blogsSqlRepository.deleteBlogById(command.id);
    return deletionResult;
  }
}
