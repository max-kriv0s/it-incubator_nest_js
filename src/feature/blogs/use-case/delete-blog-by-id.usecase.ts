import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../blogs.repository';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { BlogsService } from '../blogs.service';

export class DeleteBlogByIdCommand {
  constructor(public id: string, public userId: string) {}
}

@CommandHandler(DeleteBlogByIdCommand)
export class DeleteBlogByIdUseCase implements ICommandHandler {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsService: BlogsService,
  ) {}

  async execute(command: DeleteBlogByIdCommand): Promise<ResultNotification> {
    const result = new ResultNotification();

    const blog = await this.blogsRepository.findBlogById(command.id);
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }

    if (!blog.thisIsOwner(command.userId)) {
      result.addError('Access is denied', ResultCodeError.NotFound);
      return result;
    }

    const isDeleted = await this.blogsService.deleteBlogById(command.id);
    if (!isDeleted) {
      result.addError('Blog not found', ResultCodeError.NotFound);
    }

    return result;
  }
}
