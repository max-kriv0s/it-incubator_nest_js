import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../users.service';
import { validateOrRejectModel } from '../../../modules/validation';
import { UsersRepository } from '../db/users.repository';
import { User } from '../entities/user.entity';

export class CreateUserCommand {
  constructor(public userDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    protected usersService: UsersService,
    protected usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<number> {
    await validateOrRejectModel(command.userDto, CreateUserDto);

    const hashPassword = await this.usersService._generatePasswordHash(
      command.userDto.password,
    );

    const user = new User();
    user.login = command.userDto.login;
    user.password = hashPassword;
    user.email = command.userDto.email;
    user.isConfirmed = true;
    await this.usersRepository.createUser(user);

    return user.id;
  }
}
