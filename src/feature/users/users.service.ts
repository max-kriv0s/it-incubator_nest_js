import { Injectable } from '@nestjs/common';
import { UsersRepository } from './db/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcrypt';
import { UserDocument, UserEmailConfirmation } from './user.schema';
import { UserPasswordRecovery } from './dto/user-password-recovery.dto';
import add from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';
import { UsersConfig } from './configuration/users.configuration';
import { EmailManagerService } from '../email-managers/email-manager.service';
import { FieldError } from '../../dto';
import { GetFieldError } from '../../utils';
import { UsersSqlRepository } from './db/users.sql-repository';
import { UserSqlDto } from './dto/user-sql.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersConfig: UsersConfig,
    private readonly emailManagerService: EmailManagerService,
    private readonly usersSqlRepository: UsersSqlRepository,
  ) {}

  async _generatePasswordHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async deleteUserById(id: string) {
    return this.usersRepository.deleteUserById(id);
  }

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<string | null> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) return null;
    if (user.isBanned()) return null;

    if (!user.emailConfirmation.isConfirmed) return null;

    const validPassword = await bcrypt.compare(
      password,
      user.accountData.password,
    );
    if (!validPassword) return null;

    return user._id.toString();
  }

  async findUserById(userId: string): Promise<UserDocument | null> {
    return this.usersRepository.findUserById(userId);
  }

  async findUserSqlById(userId: string): Promise<UserSqlDto | null> {
    return this.usersSqlRepository.findUserById(userId);
  }

  async passwordRecovery(email: string): Promise<boolean> {
    const passwordRecovery: UserPasswordRecovery = {
      recoveryCode: uuidv4(),
      expirationDate: add(new Date(), this.usersConfig.getCodeLifeTime()),
    };

    const user = await this.usersRepository.findByLoginOrEmail(email);
    if (!user) return false;

    user.updatePasswordRecovery(passwordRecovery);
    this.usersRepository.save(user);

    this.emailManagerService.sendPasswordRecovery(
      email,
      passwordRecovery.recoveryCode,
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
    if (user.passwordRecovery.expirationDate < new Date()) return false;

    const newPasswordHash = await this._generatePasswordHash(newPassword);

    user.updateUserPassword(newPasswordHash);
    this.usersRepository.save(user);

    return true;
  }

  async confirmRegistration(code: string): Promise<boolean> {
    const user = await this.usersRepository.findUserByCodeConfirmation(code);

    if (!user) return false;
    if (user.emailConfirmation.expirationDate <= new Date()) return false;
    if (user.emailConfirmation.isConfirmed) return false;

    user.isConfirmed();
    this.usersRepository.save(user);
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
    const newUser = this.usersRepository.createUser({
      ...userDto,
      password: passwordHash,
    });

    const emailConfirmation: UserEmailConfirmation = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), this.usersConfig.getCodeLifeTime()),
      isConfirmed: false,
    };

    newUser.updateEmailConfirmation(emailConfirmation);
    this.usersRepository.save(newUser);

    this.emailManagerService.sendEmailConfirmationMessage(
      newUser.accountData.email,
      emailConfirmation.confirmationCode,
    );

    return null;
  }

  async resendingConfirmationCodeToUser(
    email: string,
  ): Promise<FieldError | null> {
    const user = await this.usersRepository.findByLoginOrEmail(email);
    if (!user) return GetFieldError('User not found', 'email');

    if (user.emailConfirmation.isConfirmed)
      return GetFieldError('Email confirmed', 'email');

    const emailConfirmation: UserEmailConfirmation = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), this.usersConfig.getCodeLifeTime()),
      isConfirmed: false,
    };

    user.updateEmailConfirmation(emailConfirmation);
    this.usersRepository.save(user);

    this.emailManagerService.sendPasswordRecoveryMessage(
      user.accountData.email,
      emailConfirmation.confirmationCode,
    );
    return null;
  }
}
