import { Injectable } from '@nestjs/common';
import { BanStatus, QueryUserDto } from '../dto/query-user.dto';
import { PaginatorUserSqlType, ViewUserDto } from '../dto/view-user.dto';
import { ViewMeDto } from '../../auth/dto/view-me.dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  UserRawSqlDocument,
  UserSqlDocument,
  convertUserRawSqlToSqlDocument,
} from '../model/user-sql.model';
import { IPaginator } from '../../../dto';

@Injectable()
export class UsersQuerySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAllUsersView(
    queryParams: QueryUserDto,
    paginator: IPaginator<ViewUserDto>,
  ): Promise<PaginatorUserSqlType> {
    const sortBy = queryParams.sortBy ? queryParams.sortBy : 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';
    const searchLoginTerm = queryParams.searchLoginTerm || '';
    const searchEmailTerm = queryParams.searchEmailTerm || '';

    const banStatus = queryParams.banStatus ?? BanStatus.all;
    const isBanFilter = banStatus !== BanStatus.all;

    const params: (string | boolean)[] = [
      isBanFilter,
      banStatus === BanStatus.banned,
    ];

    let searchFilter = `true`;
    if (searchLoginTerm && searchEmailTerm) {
      searchFilter = `"login" ILIKE $3 OR "email" ILIKE $4`;
      params.push(`%${searchLoginTerm}%`);
      params.push(`%${searchEmailTerm}%`);
    } else if (searchLoginTerm) {
      searchFilter = `"login" ILIKE $3`;
      params.push(`%${searchLoginTerm}%`);
    } else if (searchEmailTerm) {
      searchFilter = `"email" ILIKE $3`;
      params.push(`%${searchEmailTerm}%`);
    }

    const usersCount: { count: number }[] = await this.dataSource.query(
      `SELECT count(*)
      FROM public."Users"
      WHERE (${searchFilter})
        AND 
        (CASE WHEN $1 THEN "isBanned" = $2
          ELSE true
        END)`,
      params,
    );

    const totalCount = +usersCount[0].count;
    const usersRaw: UserRawSqlDocument[] = await this.dataSource.query(
      `SELECT *
      FROM public."Users"
      WHERE (${searchFilter})
        AND 
        (CASE WHEN $1 THEN "isBanned" = $2
          ELSE true
        END)
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT ${paginator.pageSize} OFFSET ${paginator.skip}`,
      params,
    );
    const users = usersRaw.map((user) => convertUserRawSqlToSqlDocument(user));
    const usersView = users.map((user) => this.userDBToUserView(user));
    return paginator.paginate(totalCount, usersView);
  }

  async getUserViewById(id: string): Promise<ViewUserDto | null> {
    const usersRaw: UserRawSqlDocument[] = await this.dataSource.query(
      `SELECT *
      FROM public."Users"
      WHERE "id" = $1;`,
      [+id],
    );
    if (!usersRaw.length) return null;
    return this.userDBToUserView(convertUserRawSqlToSqlDocument(usersRaw[0]));
  }

  userDBToUserView(user: UserSqlDocument): ViewUserDto {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate ? user.banDate.toISOString() : user.banDate,
        banReason: user.banReason,
      },
    };
  }

  async getMeView(id: string): Promise<ViewMeDto | null> {
    const users = await this.dataSource.query(
      `SELECT "id", "login", "email"
        FROM public."Users"
        WHERE "id" = $1
        `,
      [+id],
    );
    if (!users.length) return null;

    return {
      email: users[0].Email,
      login: users[0].Login,
      userId: id.toString(),
    };
  }
}
