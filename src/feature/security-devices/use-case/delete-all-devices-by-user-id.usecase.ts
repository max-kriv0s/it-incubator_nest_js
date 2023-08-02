import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesService } from '../security-devices.service';

export class DeleteAllDevicesByUsersIdCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteAllDevicesByUsersIdCommand)
export class DeleteAllDevicesByUsersIdUseCase
  implements ICommandHandler<DeleteAllDevicesByUsersIdCommand>
{
  constructor(
    private readonly securityDevicesService: SecurityDevicesService,
  ) {}

  async execute(command: DeleteAllDevicesByUsersIdCommand) {
    await this.securityDevicesService.deleteAllDevicesByUserID(command.userId);
  }
}
