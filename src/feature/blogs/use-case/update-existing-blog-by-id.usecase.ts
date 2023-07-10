import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { BlogsRepository } from '../blogs.repository';
import { validateOrRejectModel } from '../../../modules/validation';
import { BlogsService } from '../blogs.service';

export class UpdateExistingBlogByIdCommand {
  constructor(
    public id: string,
    public updateDto: UpdateBlogDto,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateExistingBlogByIdCommand)
export class UpdateExistingBlogByIdUseCase
  implements ICommandHandler<UpdateExistingBlogByIdCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsService: BlogsService,
  ) {}

  async execute(
    command: UpdateExistingBlogByIdCommand,
  ): Promise<ResultNotification> {
    await validateOrRejectModel(command.updateDto, UpdateBlogDto);

    const result = new ResultNotification();

    const blog = await this.blogsRepository.findBlogById(command.id);
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }
    if (!blog.thisIsOwner(command.userId)) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    blog.updateBlog(command.updateDto);
    await this.blogsRepository.save(blog);

    return result;
  }
}
