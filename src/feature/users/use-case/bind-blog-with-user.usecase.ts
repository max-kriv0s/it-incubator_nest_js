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
export class BindBlogWithUserUseCase implements ICommandHandler {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly usersService: UsersService,
  ) {}

  async execute(command: BindBlogWithUserCommand): Promise<ResultNotification> {
    const result = new ResultNotification();
    const blog = await this.blogsService.findBlogModelById(command.blogId);
    if (!blog || blog.blogOwner.userId) {
      result.addError('Blog not found', ResultCodeError.NotFound, 'blogId');
      return result;
    }

    const user = await this.usersService.findUserById(command.userId);
    if (!user) {
      result.addError('User not found', ResultCodeError.NotFound, 'userId');
      return result;
    }

    return result;
  }
}
