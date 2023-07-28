import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';
import {
  LoginUserSqlDto,
  UserConfirmationCode,
  UserSqlDto,
} from '../dto/user-sql.dto';
import { UserRawSqlDto } from '../dto/user-raw-sql.dto';
import { UserPasswordRecovery } from '../dto/user-password-recovery.dto';
import { UserEmailConfirmation } from '../user.schema';

@Injectable()
export class UsersSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createUser(userDto: CreateUserDto): Promise<string | null> {
    const users = await this.dataSource.query(
      `INSERT INTO public."Users"
        ("Login", "Password", "Email", "CreatedAt", "IsConfirmed")
       VALUES ($1, $2, $3, $4, $5) RETURNING "Id";`,
      [userDto.login, userDto.password, userDto.email, new Date(), true],
    );

    if (!users.length) return null;
    return users[0].Id;
  }

  async deleteUsers() {
    await this.dataSource.query(`
    DELETE FROM public."Users"`);
  }

  // TODO подумать, возможно лучше устанавливать метку удаления, чем удалять записи из базы
  async deleteUserById(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM public."Users"
    WHERE "Id" = $1
    `,
      [id],
    );
    return result.length === 2 && result[1] === 1;
  }

  async updateBanUnban(
    userId: string,
    updateDto: UpdateBanUserDto,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
      UPDATE public."Users"
        SET "IsBanned" = $1, "BanDate" = $2, "BanReason" = $3
      WHERE "Id" = $4;`,
      [updateDto.isBanned, updateDto.banDate, updateDto.banReason, userId],
    );
    return result.length === 2 && result[1] === 1;
  }

  async findUserById(userId: string): Promise<UserSqlDto | null> {
    const users = await this.dataSource.query(
      `SELECT 
        "Id", 
        "IsBanned"
      FROM public."Users"
      WHERE "Id" = $1;`,
      [userId],
    );

    if (!users.length) return null;
    return this.convertUserRawSqlToUserSql(users[0]);
  }

  convertUserRawSqlToUserSql(user: UserRawSqlDto): UserSqlDto {
    return {
      id: user.Id,
      isBanned: user.IsBanned,
    };
  }

  async updateRecoveryCode(
    loginOrEmail: string,
    passwordRecovery: UserPasswordRecovery,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public."Users"
        SET "RecoveryCode" = $1, "RecoveryExpirationDate" = $2
      WHERE "Login" = $3 OR "Email" = $3
      `,
      [
        passwordRecovery.recoveryCode,
        passwordRecovery.expirationDate,
        loginOrEmail,
      ],
    );
    return result.length === 2 && result[1] === 1;
  }

  async findUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<(UserPasswordRecovery & { id: string }) | null> {
    const users = await this.dataSource.query(
      `SELECT "Id", "RecoveryCode", "RecoveryExpirationDate"
      FROM public."Users"
      WHERE "RecoveryCode" = $1`,
      [recoveryCode],
    );
    if (!users.length) return null;
    return {
      id: users[0].Id,
      recoveryCode: users[0].RecoveryCode,
      expirationDate: users[0].RecoveryExpirationDate,
    };
  }

  async updateUserPassword(
    userId: string,
    newPassword: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public."Users"
        SET "Password" = $2
        WHERE "Id" = $1`,
      [userId, newPassword],
    );
    return result.length === 2 && result[1] === 1;
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<LoginUserSqlDto | null> {
    const users = await this.dataSource.query(
      `SELECT "Id", "Password", "IsBanned", "IsConfirmed"
      FROM public."Users"
      WHERE "Login" = $1 OR "Email" = $1
      `,
      [loginOrEmail],
    );
    if (!users.length) return null;
    return {
      id: users[0].Id,
      password: users[0].Password,
      isBanned: users[0].IsBanned,
      isConfirmed: users[0].IsConfirmed,
    };
  }

  async findUserByCodeConfirmation(
    code: string,
  ): Promise<UserConfirmationCode | null> {
    const users = await this.dataSource.query(
      `SELECT "Id", "EmailExpirationDate", "IsConfirmed"
      FROM public."Users"
      WHERE "ConfirmationCode" = $1`,
      [code],
    );
    if (!users.length) return null;
    return {
      id: users[0].Id,
      isConfirmed: users[0].IsConfirmed,
      expirationDate: users[0].EmailExpirationDate,
    };
  }

  async isConfirmedUser(userId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public."Users"
      SET "IsConfirmed" = true
      WHERE "Id" = $1`,
      [userId],
    );

    return result.length === 2 && result[1] === 1;
  }

  async updateEmailConfirmation(
    userId: string,
    emailConfirmation: UserEmailConfirmation,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public."Users"
      SET "IsConfirmed" = $2, "ConfirmationCode" = $3, "EmailExpirationDate" = $4
      WHERE "Id" = $1
      `,
      [
        userId,
        emailConfirmation.isConfirmed,
        emailConfirmation.confirmationCode,
        emailConfirmation.expirationDate,
      ],
    );
    return result.length === 2 && result[1] === 1;
  }
}
