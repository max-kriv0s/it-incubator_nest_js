import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';

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
}
