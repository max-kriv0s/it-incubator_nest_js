import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBanUserInputDto } from '../dto/blogger-ban-user-input.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { validateOrRejectModel } from '../../../modules/validation';
import { BlogsRepository } from 'src/feature/blogs/db/blogs.repository';
import { UsersRepository } from 'src/feature/users/db/users.repository';
import { BloggersRepository } from '../db/bloggers.repository';
import { BloggerBannedUser } from '../entities/blogger-banned-user.entity';

export class BloggerBanUnbanUserCommand {
  constructor(
    public userId: number,
    public bannedUserId: number,
    public banUserInputDto: BloggerBanUserInputDto,
  ) {}
}

@CommandHandler(BloggerBanUnbanUserCommand)
export class BloggerBanUnbanUserUseCase
  implements ICommandHandler<BloggerBanUnbanUserCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly bloggersRepository: BloggersRepository,
  ) {}

  async execute(
    command: BloggerBanUnbanUserCommand,
  ): Promise<ResultNotification<null>> {
    await validateOrRejectModel(
      command.banUserInputDto,
      BloggerBanUserInputDto,
    );

    const result = new ResultNotification<null>();

    const blog = await this.blogsRepository.findBlogById(
      +command.banUserInputDto.blogId,
    );
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound, 'blogId');
      return result;
    }
    if (blog.ownerId !== command.userId) {
      result.addError('Access is denied', ResultCodeError.Forbidden, 'blogId');
      return result;
    }

    const userForBan = await this.usersRepository.findUserById(
      command.bannedUserId,
    );
    if (!userForBan) {
      result.addError('User not found', ResultCodeError.NotFound, 'id');
      return result;
    }

    let bannedUser =
      await this.bloggersRepository.findBannedUserByBlogIdAndUserId(
        +command.banUserInputDto.blogId,
        command.bannedUserId,
      );

    const isBanned = command.banUserInputDto.isBanned;
    const banDate = isBanned ? new Date() : null;
    const banReason = isBanned ? command.banUserInputDto.banReason : null;

    const isNewBannedUser = !bannedUser;
    if (!bannedUser) {
      bannedUser = new BloggerBannedUser();
      bannedUser.blogId = blog.id;
      bannedUser.bannedUserId = command.bannedUserId;
    }

    bannedUser.isBanned = isBanned;
    bannedUser.banDate = banDate;
    bannedUser.banReason = banReason;

    if (isNewBannedUser) {
      await this.bloggersRepository.createBloggerBannedUsers(bannedUser);
    } else {
      await this.bloggersRepository.save(bannedUser);
    }

    return result;
  }
}
