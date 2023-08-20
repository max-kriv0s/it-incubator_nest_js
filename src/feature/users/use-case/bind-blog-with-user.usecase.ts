import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { BlogsService } from '../../../feature/blogs/blogs.service';
import { UsersService } from '../users.service';

export class BindBlogWithUserCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase
  implements ICommandHandler<BindBlogWithUserCommand>
{
  constructor(
    private readonly blogsService: BlogsService,
    private readonly usersService: UsersService,
  ) {}

  async execute(command: BindBlogWithUserCommand): Promise<ResultNotification> {
    const result = new ResultNotification();
    const blog = await this.blogsService.findBlogSqlById(command.blogId);
    if (!blog || blog.ownerId) {
      result.addError('Blog not found', ResultCodeError.NotFound, 'blogId');
      return result;
    }

    const user = await this.usersService.findUserSqlById(+command.userId);
    if (!user) {
      result.addError('User not found', ResultCodeError.NotFound, 'userId');
      return result;
    }

    await this.blogsService.updateOwnerById(command.blogId, command.userId);
    return result;
  }
}
