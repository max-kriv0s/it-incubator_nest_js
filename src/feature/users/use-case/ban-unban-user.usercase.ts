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
import { DataSource, EntityManager } from 'typeorm';
import { TransactionDecorator } from '../../../decorators/transaction.decorator';

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
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: BanUnbanUserCommand): Promise<ResultNotification> {
    const transactionDecorator = new TransactionDecorator(this.dataSource);

    return transactionDecorator.doOperation(
      command,
      async (command, manager) => {
        const updateResult = new ResultNotification();

        const user = await this.usersRepository.findUserById(command.userId);
        if (!user) {
          updateResult.addError('User not found', ResultCodeError.NotFound);
          return updateResult;
        }
        user.banUnban(command.dto.isBanned, command.dto.banReason);
        await manager.save(user);

        await this.deleteAllDevicesByUsersId(
          command.userId,
          command.dto.isBanned,
          manager,
        );

        await this.blogsRepository.setBanUnbaneBlogByOwnerId(
          command.userId,
          command.dto.isBanned,
          manager,
        );

        await this.commentsRepository.updateBanUnban(
          command.userId,
          command.dto.isBanned,
          manager,
        );

        await this.likePostsRepository.updateBanUnban(
          command.userId,
          command.dto.isBanned,
          manager,
        );
        await this.likeCommentsRepository.updateBanUnban(
          command.userId,
          command.dto.isBanned,
          manager,
        );
        return updateResult;
      },
    );
  }

  private async deleteAllDevicesByUsersId(
    userId: number,
    isBanned: boolean,
    manager: EntityManager,
  ) {
    if (isBanned) {
      await this.securityDevicesService.deleteAllDevicesByUserID(
        userId,
        manager,
      );
    }
  }
}
