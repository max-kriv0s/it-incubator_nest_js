import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogPostDto } from '../dto/create-blog-post.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { validateOrRejectModel } from '../../../modules/validation';
import { PostsService } from '../../../feature/posts/posts.service';
import { BlogsSqlRepository } from '../db/blogs.sql-repository';

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
    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute(
    command: CreatePostByBlogIdCommand,
  ): Promise<ResultNotification<string>> {
    await validateOrRejectModel(command.createPostDto, CreateBlogPostDto);

    const creationResult = new ResultNotification<string>();

    const blog = await this.blogsSqlRepository.findBlogById(command.blogId);
    if (!blog) {
      creationResult.addError('Blog not found', ResultCodeError.NotFound);
      return creationResult;
    }

    if (blog.ownerId !== command.userId) {
      creationResult.addError('Access is denied', ResultCodeError.Forbidden);
    }

    const postId = await this.postsService.createPostByBlogId(
      blog.id,
      blog.name,
      command.createPostDto,
    );

    creationResult.addData(postId);
    return creationResult;
  }
}
