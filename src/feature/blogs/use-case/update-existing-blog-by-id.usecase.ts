import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { validateOrRejectModel } from '../../../modules/validation';
import { BlogsSqlRepository } from '../db/blogs.sql-repository';

export class UpdateExistingBlogByIdCommand {
  constructor(
    public id: number,
    public updateDto: UpdateBlogDto,
    public userId: number,
  ) {}
}

@CommandHandler(UpdateExistingBlogByIdCommand)
export class UpdateExistingBlogByIdUseCase
  implements ICommandHandler<UpdateExistingBlogByIdCommand>
{
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(
    command: UpdateExistingBlogByIdCommand,
  ): Promise<ResultNotification> {
    await validateOrRejectModel(command.updateDto, UpdateBlogDto);

    const updateResult = new ResultNotification();

    const blog = await this.blogsSqlRepository.findBlogById(command.id);
    if (!blog) {
      updateResult.addError('Blog not found', ResultCodeError.NotFound);
      return updateResult;
    }
    if (blog.ownerId !== command.userId) {
      updateResult.addError('Access is denied', ResultCodeError.Forbidden);
      return updateResult;
    }
    await this.blogsSqlRepository.updateBlog(command.id, command.updateDto);
    return updateResult;
  }
}
