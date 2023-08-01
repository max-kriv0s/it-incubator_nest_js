import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';
import { UserPasswordRecovery } from '../dto/user-password-recovery.dto';
import { UserEmailConfirmation } from '../model/user.schema';
import { UserSqlDocument } from '../model/user-sql.model';

@Injectable()
export class UsersSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createUser(userDto: CreateUserDto): Promise<number | null> {
    const users: UserSqlDocument[] = await this.dataSource.query(
      `INSERT INTO public."Users"
        ("login", "password", "email", "createdAt", "isConfirmed")
       VALUES ($1, $2, $3, $4, $5) RETURNING "id";`,
      [userDto.login, userDto.password, userDto.email, new Date(), true],
    );

    if (!users.length) return null;
    return users[0].id;
  }

  async deleteUsers() {
    await this.dataSource.query(`DELETE FROM public."Users"`);
  }

  async deleteUserById(id: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM public."Users"
      WHERE "id" = $1`,
      [id],
    );
    return result.length === 2 && result[1] === 1;
  }

  async updateBanUnban(userId: number, updateDto: UpdateBanUserDto) {
    await this.dataSource.query(
      `UPDATE public."Users"
       SET "isBanned" = $1, "banDate" = $2, "banReason" = $3
      WHERE "id" = $4;`,
      [updateDto.isBanned, updateDto.banDate, updateDto.banReason, userId],
    );
  }

  async findUserById(userId: number): Promise<UserSqlDocument | null> {
    const users = await this.dataSource.query(
      `SELECT *
      FROM public."Users"
      WHERE "id" = $1;`,
      [userId],
    );

    if (!users.length) return null;
    return users[0];
  }

  async updateRecoveryCode(
    userId: number,
    passwordRecovery: UserPasswordRecovery,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public."Users"
        SET "passwordRecoveryCode" = $1, "passwordRecoveryExpirationDate" = $2
      WHERE "id" = $3
      `,
      [passwordRecovery.recoveryCode, passwordRecovery.expirationDate, userId],
    );
    return result.length === 2 && result[1] === 1;
  }

  async findUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<UserSqlDocument | null> {
    const users: UserSqlDocument[] = await this.dataSource.query(
      `SELECT *
      FROM public."Users"
      WHERE "passwordRecoveryCode" = $1`,
      [recoveryCode],
    );
    if (!users.length) return null;
    return users[0];
  }

  async updateUserPassword(
    userId: number,
    newPassword: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public."Users"
        SET "password" = $2
        WHERE "id" = $1`,
      [userId, newPassword],
    );
    return result.length === 2 && result[1] === 1;
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserSqlDocument | null> {
    const users: UserSqlDocument[] = await this.dataSource.query(
      `SELECT *
      FROM public."Users"
      WHERE "login" = $1 OR "email" = $1`,
      [loginOrEmail],
    );
    if (!users.length) return null;
    return users[0];
  }

  async findUserByCodeConfirmation(
    code: string,
  ): Promise<UserSqlDocument | null> {
    const users: UserSqlDocument[] = await this.dataSource.query(
      `SELECT *
      FROM public."Users"
      WHERE "confirmationCode" = $1`,
      [code],
    );
    if (!users.length) return null;
    return users[0];
  }

  async UpdateUserConfirmed(userId: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public."Users"
      SET "isConfirmed" = true
      WHERE "id" = $1`,
      [userId],
    );

    return result.length === 2 && result[1] === 1;
  }

  async updateEmailConfirmation(
    userId: number,
    emailConfirmation: UserEmailConfirmation,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public."Users"
      SET "isConfirmed" = $2, "confirmationCode" = $3, "emailConfirmationExpirationDate" = $4
      WHERE "id" = $1
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
