import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../../posts/posts.service';
import { validateOrRejectModel } from '../../../modules/validation';
import { UpdatePostDto } from '../../posts/dto/update-post.dto';
import { BlogPostUpdateDto } from '../dto/blog-post-update.dto';
import { BlogsService } from '../../blogs/blogs.service';
import {
  ResultCodeError,
  ResultNotification,
  ResultNotificationErrorType,
} from '../../../modules/notification';

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
    private readonly postsService: PostsService,
    private readonly blogsService: BlogsService,
  ) {}

  async execute(command: UpdatePostByIdCommand): Promise<any> {
    await validateOrRejectModel(command.updateDto, BlogPostUpdateDto);

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

    const postUpdateDto: UpdatePostDto = {
      title: command.updateDto.title,
      shortDescription: command.updateDto.shortDescription,
      content: command.updateDto.content,
      blogId: command.blogId,
    };

    const resultUpdate: ResultNotification<boolean> =
      await this.postsService.updatePost(command.postId, postUpdateDto);

    if (resultUpdate.hasError()) {
      const error: ResultNotificationErrorType = resultUpdate.getError();
      result.addError(error.message, error.code);
    } else {
      result.addData(true);
    }
    return result;
  }
}
