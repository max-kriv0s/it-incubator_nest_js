import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogPostDto } from '../dto/create-blog-post.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { validateOrRejectModel } from '../../../modules/validation';
import { BlogsRepository } from '../db/blogs.repository';
import { PostsRepository } from '../../../feature/posts/db/posts.repository';
import { Post } from '../../../feature/posts/entities/post.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostCreatedEvent } from 'src/events/post-created.event';

export class CreatePostByBlogIdCommand {
  constructor(
    public blogId: number,
    public createPostDto: CreateBlogPostDto,
    public userId: number,
  ) {}
}

@CommandHandler(CreatePostByBlogIdCommand)
export class CreatePostByBlogIdUseCase
  implements ICommandHandler<CreatePostByBlogIdCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    command: CreatePostByBlogIdCommand,
  ): Promise<ResultNotification<number>> {
    await validateOrRejectModel(command.createPostDto, CreateBlogPostDto);

    const creationResult = new ResultNotification<number>();

    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) {
      creationResult.addError('Blog not found', ResultCodeError.NotFound);
      return creationResult;
    }

    if (blog.ownerId !== command.userId) {
      creationResult.addError('Access is denied', ResultCodeError.Forbidden);
    }

    const newPost = new Post();
    newPost.title = command.createPostDto.title;
    newPost.content = command.createPostDto.content;
    newPost.shortDescription = command.createPostDto.shortDescription;
    newPost.blogId = command.blogId;
    await this.postsRepository.createPostByBlogId(newPost);

    this.eventEmitter.emit(
      'post.created',
      new PostCreatedEvent(newPost.title, blog.id, blog.name),
    );

    creationResult.addData(newPost.id);
    return creationResult;
  }
}
