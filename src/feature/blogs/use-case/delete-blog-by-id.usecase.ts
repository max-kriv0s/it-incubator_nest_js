import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { BlogsRepository } from '../db/blogs.repository';

export class DeleteBlogByIdCommand {
  constructor(public id: number, public userId: number) {}
}

@CommandHandler(DeleteBlogByIdCommand)
export class DeleteBlogByIdUseCase
  implements ICommandHandler<DeleteBlogByIdCommand>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogByIdCommand): Promise<ResultNotification> {
    const deletionResult = new ResultNotification();

    const blog = await this.blogsRepository.findBlogById(command.id);
    if (!blog) {
      deletionResult.addError('Blog not found', ResultCodeError.NotFound);
      return deletionResult;
    }

    if (blog.ownerId !== command.userId) {
      deletionResult.addError('Access is denied', ResultCodeError.Forbidden);
      return deletionResult;
    }

    await this.blogsRepository.deleteBlogById(command.id);
    return deletionResult;
  }
}
