import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateOrRejectModel } from '../../../modules/validation';
import { UpdatePostDto } from '../../posts/dto/update-post.dto';
import { BlogPostUpdateDto } from '../dto/blog-post-update.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { PostsRepository } from '../../../feature/posts/db/posts.repository';
import { BlogsRepository } from '../../../feature/blogs/db/blogs.repository';

export class UpdatePostByIdCommand {
  constructor(
    public blogId: number,
    public postId: number,
    public updateDto: BlogPostUpdateDto,
    public userId: number,
  ) {}
}

@CommandHandler(UpdatePostByIdCommand)
export class UpdatePostByIdUseCase
  implements ICommandHandler<UpdatePostByIdCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: UpdatePostByIdCommand,
  ): Promise<ResultNotification<boolean>> {
    await validateOrRejectModel(command.updateDto, BlogPostUpdateDto);

    const result = new ResultNotification<boolean>();

    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }
    if (blog.ownerId !== command.userId) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    const post = await this.postsRepository.findPostById(command.postId);
    if (!post) {
      result.addError('Post not found', ResultCodeError.NotFound);
      return result;
    }

    post.title = command.updateDto.title;
    post.shortDescription = command.updateDto.shortDescription;
    post.content = command.updateDto.content;
    post.blogId = command.blogId;
    await this.postsRepository.save(post);

    result.addData(true);
    return result;
  }
}
