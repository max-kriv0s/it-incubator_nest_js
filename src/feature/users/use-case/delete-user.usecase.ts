import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../db/users.repository';

export class DeleteUserCommand {
  constructor(public id: number) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(protected usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand): Promise<boolean> {
    const result = await this.usersRepository.deleteUserById(command.id);
    if (result.affected && result.affected > 0) return true;
    return false;
  }
}
