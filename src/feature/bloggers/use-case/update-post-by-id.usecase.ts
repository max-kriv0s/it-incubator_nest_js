import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateOrRejectModel } from '../../../modules/validation';
import { UpdatePostDto } from '../../posts/dto/update-post.dto';
import { BlogPostUpdateDto } from '../dto/blog-post-update.dto';
import {
  ResultCodeError,
  ResultNotification,
  ResultNotificationErrorType,
} from '../../../modules/notification';
import { BlogsSqlRepository } from '../../../feature/blogs/db/blogs.sql-repository';
import { PostsSqlRepository } from '../../../feature/posts/db/posts.sql-repository';

export class UpdatePostByIdCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public updateDto: BlogPostUpdateDto,
    public userId: string,
  ) {}
}

@CommandHandler(UpdatePostByIdCommand)
export class UpdatePostByIdUseCase
  implements ICommandHandler<UpdatePostByIdCommand>
{
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute(
    command: UpdatePostByIdCommand,
  ): Promise<ResultNotification<boolean>> {
    await validateOrRejectModel(command.updateDto, BlogPostUpdateDto);

    const result = new ResultNotification<boolean>();

    const blog = await this.blogsSqlRepository.findBlogById(command.blogId);
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }
    if (blog.ownerId !== command.userId) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    const postUpdateDto: UpdatePostDto = {
      title: command.updateDto.title,
      shortDescription: command.updateDto.shortDescription,
      content: command.updateDto.content,
      blogId: command.blogId,
    };

    const post = await this.postsSqlRepository.findPostById(command.postId);
    if (!post) {
      result.addError('Post not found', ResultCodeError.NotFound);
      return result;
    }
    await this.postsSqlRepository.updatePost(command.postId, postUpdateDto);
    // const resultUpdate: ResultNotification<boolean> =
    //   await this.postsService.updatePost(command.postId, postUpdateDto);

    // if (resultUpdate.hasError()) {
    //   const error: ResultNotificationErrorType = resultUpdate.getError();
    //   result.addError(error.message, error.code);
    // } else {
    //   result.addData(true);
    // }
    result.addData(true);
    return result;
  }
}
