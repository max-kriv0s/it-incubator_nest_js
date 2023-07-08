import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../../posts/posts.service';
import { BlogsService } from '../../blogs/blogs.service';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';

export class DeletePostByIdCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdUseCase implements ICommandHandler {
  constructor(
    private readonly postsService: PostsService,
    private readonly blogsService: BlogsService,
  ) {}

  async execute(command: DeletePostByIdCommand): Promise<any> {
    const result = new ResultNotification<boolean>();

    const blog = await this.blogsService.findBlogModelById(command.blogId);
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }
    if (!blog.thisIsOwner(command.userId)) {
      result.addError('Access is denied', ResultCodeError.NotFound);
      return result;
    }

    const isDeleted = await this.postsService.deletePostById(command.postId);

    if (!isDeleted) {
      result.addError('Post not found', ResultCodeError.NotFound);
    } else {
      result.addData(true);
    }
    return result;
  }
}
