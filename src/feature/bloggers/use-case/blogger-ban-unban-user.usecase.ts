import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBanUserInputDto } from '../dto/blogger-ban-user-input.dto';
import { BlogsRepository } from '../../blogs/db/blogs.repository';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { validateOrRejectModel } from '../../../modules/validation';
import { UsersRepository } from '../../../feature/users/db/users.repository';
import { BloggersRepository } from '../db/bloggers.repository';

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
      command.banUserInputDto.blogId,
    );
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound, 'blogId');
      return result;
    }
    if (!blog.thisIsOwner(command.userId)) {
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
      await this.bloggersRepository.findBannedUserByblogIdAndUserId(
        command.banUserInputDto.blogId,
        command.bannedUserId,
      );

    if (!bannedUser) {
      // const userForBan = await this.usersRepository.findUserById(
      //   command.bannedUserId,
      // );
      // const userLogin = userForBan ? userForBan.accountData.login : '';
      bannedUser = this.bloggersRepository.createBloggerBannedUsers(
        command.bannedUserId,
        userForBan.accountData.login,
        blog.id,
      );
    }

    bannedUser.updateBannedUser(command.banUserInputDto);
    await this.bloggersRepository.save(bannedUser);
    return result;
  }
}
