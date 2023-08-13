import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBanUserInputDto } from '../dto/blogger-ban-user-input.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { validateOrRejectModel } from '../../../modules/validation';
import { UsersSqlRepository } from '../../../feature/users/db/users.sql-repository';
import { BlogsSqlRepository } from '../../../feature/blogs/db/blogs.sql-repository';
import { BloggersSqlRepository } from '../db/bloggers.sql-repository';

export class BloggerBanUnbanUserCommand {
  constructor(
    public userId: string,
    public bannedUserId: string,
    public banUserInputDto: BloggerBanUserInputDto,
  ) {}
}

@CommandHandler(BloggerBanUnbanUserCommand)
export class BloggerBanUnbanUserUseCase
  implements ICommandHandler<BloggerBanUnbanUserCommand>
{
  constructor(
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly bloggersSqlRepository: BloggersSqlRepository,
  ) {}

  async execute(
    command: BloggerBanUnbanUserCommand,
  ): Promise<ResultNotification<null>> {
    await validateOrRejectModel(
      command.banUserInputDto,
      BloggerBanUserInputDto,
    );

    const result = new ResultNotification<null>();

    const blog = await this.blogsSqlRepository.findBlogById(
      command.banUserInputDto.blogId,
    );
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound, 'blogId');
      return result;
    }
    if (blog.ownerId !== command.userId) {
      result.addError('Access is denied', ResultCodeError.Forbidden, 'blogId');
      return result;
    }

    const userForBan = await this.usersSqlRepository.findUserById(
      command.bannedUserId,
    );
    if (!userForBan) {
      result.addError('User not found', ResultCodeError.NotFound, 'id');
      return result;
    }

    let bannedUser =
      await this.bloggersSqlRepository.findBannedUserByBlogIdAndUserId(
        command.banUserInputDto.blogId,
        command.bannedUserId,
      );

    if (!bannedUser) {
      bannedUser = await this.bloggersSqlRepository.createBloggerBannedUsers(
        command.bannedUserId,
        blog.id,
      );
    }

    await this.bloggersSqlRepository.updateBannedUser(
      bannedUser.id,
      command.banUserInputDto,
    );
    return result;
  }
}
