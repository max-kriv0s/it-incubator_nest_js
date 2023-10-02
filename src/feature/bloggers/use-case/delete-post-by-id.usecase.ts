import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { BlogsRepository } from '../../../feature/blogs/db/blogs.repository';
import { PostsRepository } from '../../../feature/posts/db/posts.repository';

export class DeletePostByIdCommand {
  constructor(
    public blogId: number,
    public postId: number,
    public userId: number,
  ) {}
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdUseCase
  implements ICommandHandler<DeletePostByIdCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: DeletePostByIdCommand,
  ): Promise<ResultNotification<null>> {
    const result = new ResultNotification<null>();

    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }
    if (blog.ownerId !== command.userId) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    const countOfDeleted = await this.postsRepository.deletePostById(
      command.postId,
    );

    if (!countOfDeleted) {
      result.addError('Post not found', ResultCodeError.NotFound);
    }

    return result;
  }
}
