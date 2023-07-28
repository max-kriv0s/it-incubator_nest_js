import { Injectable } from '@nestjs/common';
import { BanStatus, QueryUserDto } from '../dto/query-user.dto';
import {
  PaginatorUserSqlView,
  PaginatorUserSqlViewType,
  ViewUserDto,
} from '../dto/view-user.dto';
import { ViewMeDto } from '../../auth/dto/view-me.dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserRawSqlDto } from '../dto/user-raw-sql.dto';
import { capitalizeFirstWord } from '../../../utils';

@Injectable()
export class UsersQuerySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAllUsersView(
    queryParams: QueryUserDto,
  ): Promise<PaginatorUserSqlViewType> {
    const banStatus = queryParams.banStatus ?? BanStatus.all;
    // const pageNumber = +queryParams.pageNumber || 1;
    // const pageSize = +queryParams.pageSize || 10;
    const sortBy = capitalizeFirstWord(
      queryParams.sortBy ? `${queryParams.sortBy}` : 'createdAt',
    );
    const sortDirection = queryParams.sortDirection || 'desc';
    const searchLoginTerm = queryParams.searchLoginTerm;
    const searchEmailTerm = queryParams.searchEmailTerm;

    const params: any[] = [];
    const filterOr: any[] = [];
    if (searchLoginTerm) {
      filterOr.push(`"Login" ILIKE $${params.length + 1}`);
      params.push(`%${searchLoginTerm}%`);
    }

    if (searchEmailTerm) {
      filterOr.push(`"Email" ILIKE $${params.length + 1}`);
      params.push(`%${searchEmailTerm}%`);
    }

    const isBanFilter = banStatus !== BanStatus.all;

    let queryFilter = '';
    if (filterOr.length > 0 && isBanFilter) {
      queryFilter = `WHERE (${filterOr.join(' OR ')}) AND "IsBanned" = $${
        params.length + 1
      }`;
      params.push(banStatus === BanStatus.banned);
    }
    if (filterOr.length > 0 && !isBanFilter) {
      queryFilter = `WHERE ${filterOr.join(' OR ')}`;
    }
    if (!filterOr.length && isBanFilter) {
      queryFilter = `WHERE "IsBanned" = $${params.length + 1}`;
      params.push(banStatus === BanStatus.banned);
    }

    const queryCount = `
    SELECT COUNT(*) 
    FROM public."Users"
    ${queryFilter}`;

    const usersCount: { count: number }[] = await this.dataSource.query(
      queryCount,
      params,
    );
    const totalCount = +usersCount[0].count;
    const result = new PaginatorUserSqlView(
      +queryParams.pageNumber,
      +queryParams.pageSize,
      totalCount,
    );
    const skip = (result.page - 1) * result.pageSize;

    const query = `
    SELECT 
      "Id", 
      "Login", 
      "Email", 
      "CreatedAt", 
      "IsBanned", 
      "BanDate", 
      "BanReason"
    FROM public."Users"
    ${queryFilter}
    ORDER BY "${sortBy}" ${sortDirection}
    LIMIT ${result.pageSize} OFFSET ${skip}
    `;
    // ORDER BY $${params.length + 1} ${sortDirection}
    // ORDER BY $${params.length + 1} $${params.length + 2}
    // params.push(sortBy);
    // params.push(sortDirection);

    const users: UserRawSqlDto[] = await this.dataSource.query(query, params);
    result.addItems(users.map((user) => this.userDBToUserView(user)));

    return result.getView();
  }

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

  async getMeView(id: string): Promise<ViewMeDto | null> {
    const users = await this.dataSource.query(
      `SELECT "Id", "Login", "Email"
        FROM public."Users"
        WHERE "Id" = $1
        `,
      [id],
    );
    if (!users.length) return null;

    return {
      email: users[0].Email,
      login: users[0].Login,
      userId: id,
    };
  }
}
