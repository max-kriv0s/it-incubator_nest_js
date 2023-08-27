import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { CreateCommentDto } from '../../../feature/comments/dto/create-comment.dto';
import { validateOrRejectModel } from '../../../modules/validation';
import { CommentsRepository } from '../../../feature/comments/db/comments.repository';
import { BloggersRepository } from '../../../feature/bloggers/db/bloggers.repository';
import { UsersRepository } from '../../../feature/users/db/users.repository';
import { PostsRepository } from '../db/posts.repository';
import { Comment } from '../../../feature/comments/entities/comment.entity';

export class CreateCommentByPostIdCommand {
  constructor(
    public postId: number,
    public userId: number,
    public createCommentDto: CreateCommentDto,
  ) {}
}

@CommandHandler(CreateCommentByPostIdCommand)
export class CreateCommentByPostIdUseCase
  implements ICommandHandler<CreateCommentByPostIdCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly bloggersRepository: BloggersRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(
    command: CreateCommentByPostIdCommand,
  ): Promise<ResultNotification<number>> {
    await validateOrRejectModel(command.createCommentDto, CreateCommentDto);

    const result = new ResultNotification<number>();

    const post = await this.postsRepository.findPostById(command.postId);
    if (!post) {
      result.addError('Post not found', ResultCodeError.NotFound);
      return result;
    }

    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) {
      result.addError('user not found', ResultCodeError.NotFound);
      return result;
    }

    const isBannedUser =
      await this.bloggersRepository.findBannedUserByBlogIdAndUserId(
        post.blogId,
        command.userId,
      );
    if (isBannedUser) {
      {
        result.addError('The user is blocked', ResultCodeError.Forbidden);
        return result;
      }
    }

    const newComment = new Comment();
    newComment.postId = command.postId;
    newComment.userId = command.userId;
    newComment.content = command.createCommentDto.content;
    await this.commentsRepository.createCommentByPostId(newComment);

    result.addData(newComment.id);
    return result;
  }
}
