import { Injectable } from '@nestjs/common';
import { BanStatus, QueryUserDto } from '../dto/query-user.dto';
import {
  PaginatorUserSql,
  PaginatorUserSqlType,
  ViewUserDto,
} from '../dto/view-user.dto';
import { ViewMeDto } from '../../auth/dto/view-me.dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserSqlDocument } from '../model/user-sql.model';

@Injectable()
export class UsersQuerySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAllUsersView(
    queryParams: QueryUserDto,
    paginator: PaginatorUserSql,
  ): Promise<PaginatorUserSqlType> {
    const sortBy = queryParams.sortBy ? queryParams.sortBy : 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';
    const searchLoginTerm = queryParams.searchLoginTerm || '';
    const searchEmailTerm = queryParams.searchEmailTerm || '';

    const banStatus = queryParams.banStatus ?? BanStatus.all;
    const isBanFilter = banStatus !== BanStatus.all;

    const params = [
      `%${searchLoginTerm}%`,
      `%${searchEmailTerm}%`,
      isBanFilter,
      banStatus === BanStatus.banned,
    ];
    const usersCount: { count: number }[] = await this.dataSource.query(
      `SELECT count(*)
      FROM public."Users"
      WHERE ("login" ILIKE $1 AND "email" ILIKE $2)
        AND 
        (CASE WHEN $3 THEN "isBanned" = $4
          ELSE true
        END)`,
      params,
    );

    const totalCount = +usersCount[0].count;
    const users: UserSqlDocument[] = await this.dataSource.query(
      `SELECT *
      FROM public."Users"
      WHERE ("login" ILIKE $1 AND "email" ILIKE $2)
        AND 
        (CASE WHEN $3 THEN "isBanned" = $4
          ELSE true
        END)
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT ${paginator.pageSize} OFFSET ${paginator.skip}`,
      params,
    );
    const usersView = users.map((user) => this.userDBToUserView(user));
    return paginator.paginate(totalCount, usersView);
  }

  async getUserViewById(id: string): Promise<ViewUserDto | null> {
    const users: UserSqlDocument[] = await this.dataSource.query(
      `SELECT *
      FROM public."Users"
      WHERE "id" = $1;`,
      [id],
    );
    if (!users.length) return null;
    return this.userDBToUserView(users[0]);
  }

  userDBToUserView(user: UserSqlDocument): ViewUserDto {
    return {
      id: user.id.toString(),
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
