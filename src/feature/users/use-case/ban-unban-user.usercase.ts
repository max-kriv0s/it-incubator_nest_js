import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUnbanUserDto } from '../dto/ban-unban-user.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { SetBanUnbanBlogsCommand } from '../../../feature/blogs/use-case/set-ban-unbane-blogs.usecase';
import { SetBanUnbanCommentsCommand } from '../../../feature/comments/use-case/set-ban-unbane-comments.usecase';
import { CountLikesPostsCommand } from '../../../feature/posts/use-case/count-likes-post.usecase';
import { CountLikesCommentsCommand } from '../../../feature/comments/use-case/count-likes-comments.usecase';
import { UsersSqlRepository } from '../db/users.sql-repository';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';
import { SecurityDevicesService } from '../../../feature/security-devices/security-devices.service';

export class BanUnbanUserCommand {
  constructor(
    public userId: number,
    public dto: BanUnbanUserDto,
    public updateResult: ResultNotification<boolean>,
  ) {}
}

@CommandHandler(BanUnbanUserCommand)
export class BanUnbanUserUseCase
  implements ICommandHandler<BanUnbanUserCommand>
{
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly securityDevicesService: SecurityDevicesService,
  ) {}

  async execute(command: BanUnbanUserCommand) {
    const userId = this.usersSqlRepository.findUserById(command.userId);
    if (!userId) {
      command.updateResult.addError('User not found', ResultCodeError.NotFound);
    }

    const updateDto: UpdateBanUserDto = {
      isBanned: command.dto.isBanned,
      banDate: command.dto.isBanned ? new Date() : null,
      banReason: command.dto.isBanned ? command.dto.banReason : null,
    };

    await this.usersSqlRepository.updateBanUnban(command.userId, updateDto);
    await this.deleteAllDevicesByUsersId(command.userId, command.dto.isBanned);

    // // убрать промисы
    // await Promise.all([
    //   this.commandBus.execute(
    //     new SetBanUnbanBlogsCommand(banUserDto.userId, banUserDto.isBanned),
    //   ),
    //   this.commandBus.execute(
    //     new SetBanUnbanCommentsCommand(banUserDto.userId, banUserDto.isBanned),
    //   ),
    // ]);

    // await Promise.all([
    //   this.commandBus.execute(
    //     new CountLikesPostsCommand(command.userId, command.dto.isBanned),
    //   ),
    //   this.commandBus.execute(
    //     new CountLikesCommentsCommand(command.userId, command.dto.isBanned),
    //   ),
    // ]);
  }

  private async deleteAllDevicesByUsersId(userId: number, isBanned: boolean) {
    if (isBanned)
      await this.securityDevicesService.deleteAllDevicesByUserID(userId);
  }
}
