import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../db/users.sql-repository';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(protected usersSqlRepository: UsersSqlRepository) {}

  async execute(command: DeleteUserCommand): Promise<boolean> {
    return this.usersSqlRepository.deleteUserById(command.id);
  }
}
