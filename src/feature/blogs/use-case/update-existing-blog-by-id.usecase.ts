import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { validateOrRejectModel } from '../../../modules/validation';
import { BlogsRepository } from '../db/blogs.repository';

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
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(
    command: UpdateExistingBlogByIdCommand,
  ): Promise<ResultNotification> {
    await validateOrRejectModel(command.updateDto, UpdateBlogDto);

    const updateResult = new ResultNotification();

    const blog = await this.blogsRepository.findBlogById(command.id);
    if (!blog) {
      updateResult.addError('Blog not found', ResultCodeError.NotFound);
      return updateResult;
    }
    if (blog.ownerId !== command.userId) {
      updateResult.addError('Access is denied', ResultCodeError.Forbidden);
      return updateResult;
    }

    blog.name = command.updateDto.name;
    blog.description = command.updateDto.description;
    blog.websiteUrl = command.updateDto.websiteUrl;
    await this.blogsRepository.save(blog);

    return updateResult;
  }
}
