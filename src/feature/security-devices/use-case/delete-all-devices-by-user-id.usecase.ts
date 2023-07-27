import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesSqlRepository } from '../db/security-devices.sql-repository';

export class DeleteAllDevicesByUsersIdCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteAllDevicesByUsersIdCommand)
export class DeleteAllDevicesByUsersIdUseCase
  implements ICommandHandler<DeleteAllDevicesByUsersIdCommand>
{
  constructor(
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async execute(command: DeleteAllDevicesByUsersIdCommand) {
    await this.securityDevicesSqlRepository.deleteAllDevicesByUserID(
      command.userId,
    );
  }
}
