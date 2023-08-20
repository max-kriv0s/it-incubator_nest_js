import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcrypt';
import add from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';
import { UsersConfig } from './configuration/users.configuration';
import { EmailManagerService } from '../email-managers/email-manager.service';
import { FieldError } from '../../dto';
import { GetFieldError } from '../../utils';
import { UsersSqlRepository } from './db/users.sql-repository';
import { UsersRepository } from './db/users.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersConfig: UsersConfig,
    private readonly emailManagerService: EmailManagerService,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async _generatePasswordHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async deleteUserById(id: string) {
    return this.usersSqlRepository.deleteUserById(id);
  }

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<number | null> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) return null;
    if (user.isBanned) return null;

    if (!user.isConfirmed) return null;

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return null;

    return user.id;
  }

  // async findUserById(userId: string): Promise<UserDocument | null> {
  //   return this.usersRepository.findUserById(userId);
  // }

  async findUserSqlById(userId: number): Promise<User | null> {
    return this.usersRepository.findUserById(userId);
  }

  async passwordRecovery(email: string): Promise<boolean> {
    const user = await this.usersRepository.findByLoginOrEmail(email);
    if (!user) return false;

    user.passwordRecoveryCode = uuidv4();
    user.passwordRecoveryExpirationDate = add(
      new Date(),
      this.usersConfig.getCodeLifeTime(),
    );

    await this.usersRepository.save(user);
    this.emailManagerService.sendPasswordRecovery(
      email,
      user.passwordRecoveryCode,
    );

    return true;
  }

  async newPassword(
    newPassword: string,
    recoveryCode: string,
  ): Promise<boolean> {
    const user = await this.usersRepository.findUserByRecoveryCode(
      recoveryCode,
    );
    if (!user) return false;
    if (user.passwordRecoveryExpirationDate < new Date()) return false;

    const newPasswordHash = await this._generatePasswordHash(newPassword);

    user.password = newPasswordHash;
    await this.usersRepository.save(user);
    return true;
  }

  async confirmRegistration(code: string): Promise<boolean> {
    const user = await this.usersRepository.findUserByCodeConfirmation(code);
    if (!user) return false;
    if (user.isConfirmed) return false;
    if (user.emailConfirmationExpirationDate <= new Date()) return false;

    user.isConfirmed = true;
    await this.usersRepository.save(user);
    return true;
  }

  async createUserForEmailConfirmation(
    userDto: CreateUserDto,
  ): Promise<FieldError | null> {
    const userByLogin = await this.usersRepository.findByLoginOrEmail(
      userDto.login,
    );
    if (userByLogin) return GetFieldError('user already exists', 'login');

    const userByEmail = await this.usersRepository.findByLoginOrEmail(
      userDto.email,
    );
    if (userByEmail) return GetFieldError('user already exists', 'email');

    const passwordHash = await this._generatePasswordHash(userDto.password);

    const newUser = new User();
    newUser.login = userDto.login;
    newUser.password = passwordHash;
    newUser.email = userDto.email;
    newUser.confirmationCode = uuidv4();
    newUser.emailConfirmationExpirationDate = add(
      new Date(),
      this.usersConfig.getCodeLifeTime(),
    );
    newUser.isConfirmed = false;

    await this.usersRepository.createUser(newUser);

    this.emailManagerService.sendEmailConfirmationMessage(
      userDto.email,
      newUser.confirmationCode,
    );

    return null;
  }

  async resendingConfirmationCodeToUser(
    email: string,
  ): Promise<FieldError | null> {
    const user = await this.usersRepository.findByLoginOrEmail(email);
    if (!user) return GetFieldError('User not found', 'email');

    if (user.isConfirmed) return GetFieldError('Email confirmed', 'email');

    user.confirmationCode = uuidv4();
    user.emailConfirmationExpirationDate = add(
      new Date(),
      this.usersConfig.getCodeLifeTime(),
    );
    user.isConfirmed = false;
    await this.usersRepository.save(user);

    this.emailManagerService.sendPasswordRecoveryMessage(
      email,
      user.confirmationCode,
    );
    return null;
  }
}
