import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUnbanUserDto } from '../dto/ban-unban-user.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { UsersSqlRepository } from '../db/users.sql-repository';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';
import { SecurityDevicesService } from '../../../feature/security-devices/security-devices.service';
import { BlogsService } from 'src/feature/blogs/blogs.service';

export class BanUnbanUserCommand {
  constructor(public userId: string, public dto: BanUnbanUserDto) {}
}

@CommandHandler(BanUnbanUserCommand)
export class BanUnbanUserUseCase
  implements ICommandHandler<BanUnbanUserCommand>
{
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly securityDevicesService: SecurityDevicesService,
    private readonly blogsService: BlogsService,
  ) {}

  async execute(command: BanUnbanUserCommand): Promise<ResultNotification> {
    const updateResult = new ResultNotification();
    const user = this.usersSqlRepository.findUserById(command.userId);
    if (!user) {
      updateResult.addError('User not found', ResultCodeError.NotFound);
      return updateResult;
    }

    const updateDto: UpdateBanUserDto = {
      isBanned: command.dto.isBanned,
      banDate: command.dto.isBanned ? new Date() : null,
      banReason: command.dto.isBanned ? command.dto.banReason : null,
    };

    await this.usersSqlRepository.updateBanUnban(command.userId, updateDto);
    await this.deleteAllDevicesByUsersId(command.userId, command.dto.isBanned);

    await this.blogsService.setBanUnbaneBlogByOwnerId(
      command.userId,
      command.dto.isBanned,
    );

    return updateResult;

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

  private async deleteAllDevicesByUsersId(userId: string, isBanned: boolean) {
    if (isBanned)
      await this.securityDevicesService.deleteAllDevicesByUserID(userId);
  }
}
