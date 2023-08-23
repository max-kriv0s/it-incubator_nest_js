import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUnbanUserDto } from '../dto/ban-unban-user.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { SecurityDevicesService } from '../../../feature/security-devices/security-devices.service';
import { UsersRepository } from '../db/users.repository';
import { BlogsRepository } from '../../../feature/blogs/db/blogs.repository';
import { CommentsRepository } from '../../../feature/comments/db/comments.repository';
import { LikePostsRepository } from '../../../feature/posts/db/like-posts.repository';
import { LikeCommentsRepository } from '../../../feature/comments/db/like-comments.repository';

export class BanUnbanUserCommand {
  constructor(public userId: number, public dto: BanUnbanUserDto) {}
}

@CommandHandler(BanUnbanUserCommand)
export class BanUnbanUserUseCase
  implements ICommandHandler<BanUnbanUserCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly securityDevicesService: SecurityDevicesService,
    private readonly blogsRepository: BlogsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly likePostsRepository: LikePostsRepository,
    private readonly likeCommentsRepository: LikeCommentsRepository,
  ) {}

  async execute(command: BanUnbanUserCommand): Promise<ResultNotification> {
    const updateResult = new ResultNotification();
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) {
      updateResult.addError('User not found', ResultCodeError.NotFound);
      return updateResult;
    }

    user.isBanned = command.dto.isBanned;
    user.banDate = command.dto.isBanned ? new Date() : null;
    user.banReason = command.dto.isBanned ? command.dto.banReason : null;

    await this.usersRepository.save(user);
    await this.deleteAllDevicesByUsersId(command.userId, command.dto.isBanned);

    await this.blogsRepository.setBanUnbaneBlogByOwnerId(
      command.userId,
      command.dto.isBanned,
    );

    await this.commentsRepository.updateBanUnban(
      command.userId,
      command.dto.isBanned,
    );

    await this.likePostsRepository.updateBanUnban(
      command.userId,
      command.dto.isBanned,
    );
    await this.likeCommentsRepository.updateBanUnban(
      command.userId,
      command.dto.isBanned,
    );
    return updateResult;
  }

  private async deleteAllDevicesByUsersId(userId: number, isBanned: boolean) {
    if (isBanned)
      await this.securityDevicesService.deleteAllDevicesByUserID(userId);
  }
}
