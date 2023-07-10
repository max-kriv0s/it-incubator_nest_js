import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../security-devices.repository';

export class DeleteAllDevicesByUsersIdCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteAllDevicesByUsersIdCommand)
export class DeleteAllDevicesByUsersIdUseCase
  implements ICommandHandler<DeleteAllDevicesByUsersIdCommand>
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute(command: DeleteAllDevicesByUsersIdCommand) {
    await this.securityDevicesRepository.deleteAllDevicesByUserID(
      command.userId,
    );
  }
}
