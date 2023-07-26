import { Injectable } from '@nestjs/common';
import { BanStatus, QueryUserDto } from '../dto/query-user.dto';
import { PaginatorUserView, ViewUserDto } from '../dto/view-user.dto';
import { ViewMeDto } from '../../auth/dto/view-me.dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserRawSqlDto } from '../dto/user-raw-sql.dto';

@Injectable()
export class UsersQuerySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  //   async getAllUsersView(queryParams: QueryUserDto): Promise<PaginatorUserView> {
  //     const banStatus = queryParams.banStatus ?? BanStatus.all;
  //     const pageNumber = +queryParams.pageNumber || 1;
  //     const pageSize = +queryParams.pageSize || 10;
  //     const sortBy = queryParams.sortBy || 'createdAt';
  //     const sortDirection = queryParams.sortDirection || 'desc';
  //     const searchLoginTerm = queryParams.searchLoginTerm;
  //     const searchEmailTerm = queryParams.searchEmailTerm;

  //     const filterOr: any[] = [];
  //     if (searchLoginTerm) {
  //       filterOr.push({
  //         'accountData.login': { $regex: searchLoginTerm, $options: 'i' },
  //       });
  //     }

  //     if (searchEmailTerm) {
  //       filterOr.push({
  //         'accountData.email': { $regex: searchEmailTerm, $options: 'i' },
  //       });
  //     }

  //     let filter: any = {};
  //     if (filterOr.length > 0) filter = { $or: filterOr };

  //     if (banStatus !== BanStatus.all) {
  //       filter['banInfo.isBanned'] = banStatus === BanStatus.banned;
  //     }

  //     const totalCount: number = await this.UserModel.countDocuments(filter);
  //     const skip = (pageNumber - 1) * pageSize;

  //     const users: UserDocument[] = await this.UserModel.find(filter, null, {
  //       sort: { ['accountData.' + sortBy]: sortDirection === 'asc' ? 1 : -1 },
  //       skip: skip,
  //       limit: pageSize,
  //     }).exec();

  //     return {
  //       pagesCount: Math.ceil(totalCount / pageSize),
  //       page: pageNumber,
  //       pageSize: pageSize,
  //       totalCount: totalCount,
  //       items: await Promise.all(users.map((i) => this.userDBToUserView(i))),
  //     };
  //   }

  async getUserViewById(id: string): Promise<ViewUserDto | null> {
    const users: UserRawSqlDto[] = await this.dataSource.query(
      `SELECT 
        "Id", 
        "Login", 
        "Email", 
        "CreatedAt", 
        "IsBanned", 
        "BanDate", 
        "BanReason"
      FROM public."Users"
      WHERE "Id" = $1;`,
      [id],
    );
    if (!users.length) return null;

    return this.userDBToUserView(users[0]);
  }

  userDBToUserView(user: UserRawSqlDto): ViewUserDto {
    return {
      id: user.Id,
      login: user.Login,
      email: user.Email,
      createdAt: user.CreatedAt.toISOString(),
      banInfo: {
        isBanned: user.IsBanned,
        banDate: user.BanDate ? user.BanDate.toISOString() : user.BanDate,
        banReason: user.BanReason,
      },
    };
  }

  //   async getMeView(id: string): Promise<ViewMeDto | null> {
  //     const userDB = await this.UserModel.findById(id);
  //     if (!userDB) return null;

  //     return {
  //       email: userDB.accountData.email,
  //       login: userDB.accountData.login,
  //       userId: id,
  //     };
  //   }
}
