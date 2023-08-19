import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUnbanUserDto } from '../dto/ban-unban-user.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { SecurityDevicesService } from '../../../feature/security-devices/security-devices.service';
import { BlogsService } from '../../../feature/blogs/blogs.service';
import { BlogsSqlRepository } from '../../../feature/blogs/db/blogs.sql-repository';
import { CommentsSqlRepository } from '../../../feature/comments/db/comments.sql-repository';
import { LikePostsSqlRepository } from '../../../feature/posts/db/like-posts.sql-repository';
import { LikeCommentsSqlRepository } from '../../../feature/comments/db/like-comments.sql-repository';
import { UsersRepository } from '../db/users.repository';

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
    private readonly blogsService: BlogsService,
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly likePostsSqlRepository: LikePostsSqlRepository,
    private readonly likeCommentsSqlRepository: LikeCommentsSqlRepository,
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

    await this.blogsService.setBanUnbaneBlogByOwnerId(
      command.userId.toString(),
      command.dto.isBanned,
    );

    await this.blogsSqlRepository.updateBanUnban(
      command.userId.toString(),
      command.dto.isBanned,
    );
    await this.commentsSqlRepository.updateBanUnban(
      command.userId.toString(),
      command.dto.isBanned,
    );

    await this.likePostsSqlRepository.updateBanUnban(
      command.userId.toString(),
      command.dto.isBanned,
    );
    await this.likeCommentsSqlRepository.updateBanUnban(
      command.userId.toString(),
      command.dto.isBanned,
    );
    return updateResult;
  }

  private async deleteAllDevicesByUsersId(userId: number, isBanned: boolean) {
    if (isBanned)
      await this.securityDevicesService.deleteAllDevicesByUserID(
        userId.toString(),
      );
  }
}
