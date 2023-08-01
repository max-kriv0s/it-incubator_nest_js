import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogPostDto } from '../dto/create-blog-post.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { validateOrRejectModel } from '../../../modules/validation';
import { BlogsRepository } from '../db/blogs.repository';
import { PostsService } from '../../../feature/posts/posts.service';

export class CreatePostByBlogIdCommand {
  constructor(
    public blogId: string,
    public createPostDto: CreateBlogPostDto,
    public userId: string,
  ) {}
}

@CommandHandler(CreatePostByBlogIdCommand)
export class CreatePostByBlogIdUseCase
  implements ICommandHandler<CreatePostByBlogIdCommand>
{
  constructor(
    private readonly postsService: PostsService,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: CreatePostByBlogIdCommand,
  ): Promise<ResultNotification<string>> {
    await validateOrRejectModel(command.createPostDto, CreateBlogPostDto);

    const result = new ResultNotification<string>();

    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }

    if (!blog.thisIsOwner(command.userId)) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
    }

    const postId = await this.postsService.createPostByBlogId(
      blog.id,
      blog.name,
      command.createPostDto,
    );

    result.addData(postId);
    return result;
  }
}
