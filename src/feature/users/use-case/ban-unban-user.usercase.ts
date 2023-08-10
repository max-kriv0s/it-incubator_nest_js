import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUnbanUserDto } from '../dto/ban-unban-user.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { UsersSqlRepository } from '../db/users.sql-repository';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';
import { SecurityDevicesService } from '../../../feature/security-devices/security-devices.service';
import { BlogsService } from '../../../feature/blogs/blogs.service';
import { BlogsSqlRepository } from '../../../feature/blogs/db/blogs.sql-repository';
import { CommentsSqlRepository } from 'src/feature/comments/db/comments.sql-repository';

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
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly commentsSqlRepository: CommentsSqlRepository,
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

    await this.blogsSqlRepository.updateBanUnban(
      command.userId,
      command.dto.isBanned,
    );
    await this.commentsSqlRepository.updateBanUnban(
      command.userId,
      command.dto.isBanned,
    );

    return updateResult;
  }

  private async deleteAllDevicesByUsersId(userId: string, isBanned: boolean) {
    if (isBanned)
      await this.securityDevicesService.deleteAllDevicesByUserID(userId);
  }
}
