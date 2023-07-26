import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../users.service';
import { validateOrRejectModel } from '../../../modules/validation';
import { UsersSqlRepository } from '../db/users.sql-repository';

export class CreateUserCommand {
  constructor(public userDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    protected usersService: UsersService,
    protected usersSqlRepository: UsersSqlRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<string | null> {
    await validateOrRejectModel(command.userDto, CreateUserDto);

    const hashPassword = await this.usersService._generatePasswordHash(
      command.userDto.password,
    );

    return this.usersSqlRepository.createUser({
      ...command.userDto,
      password: hashPassword,
    });
  }
}
