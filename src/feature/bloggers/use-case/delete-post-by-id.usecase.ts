import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { BlogsSqlRepository } from '../../../feature/blogs/db/blogs.sql-repository';
import { PostsSqlRepository } from '../../../feature/posts/db/posts.sql-repository';

export class DeletePostByIdCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdUseCase
  implements ICommandHandler<DeletePostByIdCommand>
{
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute(
    command: DeletePostByIdCommand,
  ): Promise<ResultNotification<null>> {
    const result = new ResultNotification<null>();

    const blog = await this.blogsSqlRepository.findBlogById(command.blogId);
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }
    if (blog.ownerId !== command.userId) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    await this.postsSqlRepository.deletePostById(command.postId);
    return result;
  }
}
