import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUnbanUserDto } from '../dto/ban-unban-user.dto';
import { DeleteAllDevicesByUsersIdCommand } from '../../../feature/security-devices/use-case/delete-all-devices-by-user-id.usecase';
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

type BanUserDto = {
  userId: string;
  isBanned: boolean;
};

export class BanUnbanUserCommand {
  constructor(public userId: string, public dto: BanUnbanUserDto) {}
}

@CommandHandler(BanUnbanUserCommand)
export class BanUnbanUserUseCase
  implements ICommandHandler<BanUnbanUserCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly usersSqlRepository: UsersSqlRepository,
  ) {}

  async execute(
    command: BanUnbanUserCommand,
  ): Promise<ResultNotification<boolean>> {
    const result = new ResultNotification<boolean>();

    const updateDto: UpdateBanUserDto = {
      isBanned: command.dto.isBanned,
      banDate: command.dto.isBanned ? new Date() : null,
      banReason: command.dto.isBanned ? command.dto.banReason : null,
    };

    const isUpdated = await this.usersSqlRepository.updateBanUnban(
      command.userId,
      updateDto,
    );

    if (!isUpdated) {
      result.addError('User not found', ResultCodeError.NotFound);
      return result;
    }

    const banUserDto: BanUserDto = {
      userId: command.userId,
      isBanned: command.dto.isBanned,
    };

    await this.deleteAllDevicesByUsersId(banUserDto);

    // // убрать промисы
    // await Promise.all([
    //   this.deleteAllDevicesByUsersId(banUserDto),
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

    return result;
  }

  private async deleteAllDevicesByUsersId(banUserDto: BanUserDto) {
    if (banUserDto.isBanned) {
      await this.commandBus.execute(
        new DeleteAllDevicesByUsersIdCommand(banUserDto.userId),
      );
    }
  }
}
