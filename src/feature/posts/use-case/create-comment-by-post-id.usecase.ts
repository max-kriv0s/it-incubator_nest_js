import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { CreateCommentDto } from '../../../feature/comments/dto/create-comment.dto';
import { PostsSqlRepository } from '../db/posts.sql-repository';
import { UsersSqlRepository } from '../../../feature/users/db/users.sql-repository';
import { BloggersSqlRepository } from '../../../feature/bloggers/db/bloggers.sql-repository';
import { validateOrRejectModel } from '../../../modules/validation';
import { CommentsSqlRepository } from '../../../feature/comments/db/comments.sql-repository';

export class CreateCommentByPostIdCommand {
  constructor(
    public postId: string,
    public userId: string,
    public createCommentDto: CreateCommentDto,
  ) {}
}

@CommandHandler(CreateCommentByPostIdCommand)
export class CreateCommentByPostIdUseCase
  implements ICommandHandler<CreateCommentByPostIdCommand>
{
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly bloggersSqlRepository: BloggersSqlRepository,
    private readonly commentsSqlRepository: CommentsSqlRepository,
  ) {}

  async execute(
    command: CreateCommentByPostIdCommand,
  ): Promise<ResultNotification<string>> {
    await validateOrRejectModel(command.createCommentDto, CreateCommentDto);

    const result = new ResultNotification<string>();

    const post = await this.postsSqlRepository.findPostById(command.postId);
    if (!post) {
      result.addError('Post not found', ResultCodeError.NotFound);
      return result;
    }

    const user = await this.usersSqlRepository.findUserById(command.userId);
    if (!user) {
      result.addError('user not found', ResultCodeError.NotFound);
      return result;
    }

    const isBannedUser =
      await this.bloggersSqlRepository.findBannedUserByBlogIdAndUserId(
        post.blogId,
        command.userId,
      );
    if (isBannedUser) {
      {
        result.addError('The user is blocked', ResultCodeError.Forbidden);
        return result;
      }
    }

    const comment = await this.commentsSqlRepository.createCommentByPostId(
      command.postId,
      command.userId,
      command.createCommentDto.content,
    );

    result.addData(comment.id);
    return result;
  }
}
