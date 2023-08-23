import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { BlogsRepository } from '../../../feature/blogs/db/blogs.repository';
import { UsersRepository } from '../db/users.repository';

export class BindBlogWithUserCommand {
  constructor(public blogId: number, public userId: number) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase
  implements ICommandHandler<BindBlogWithUserCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: BindBlogWithUserCommand): Promise<ResultNotification> {
    const result = new ResultNotification();
    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog || blog.ownerId) {
      result.addError('Blog not found', ResultCodeError.NotFound, 'blogId');
      return result;
    }

    const user = await this.usersRepository.findUserById(+command.userId);
    if (!user) {
      result.addError('User not found', ResultCodeError.NotFound, 'userId');
      return result;
    }

    blog.ownerId = command.userId;
    await this.blogsRepository.save(blog);

    return result;
  }
}
