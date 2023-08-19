import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { PaginatorUserSqlType, ViewUserDto } from '../dto/view-user.dto';
import { Repository } from 'typeorm';
import { BanStatus, QueryUserDto } from '../dto/query-user.dto';
import { IPaginator } from '../../../dto';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

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

    const query = await this.usersRepository.createQueryBuilder('users');

    if (searchLoginTerm && searchEmailTerm) {
      query.where(
        'users."login" ILIKE :searchLoginTerm OR users."email" ILIKE :searchEmailTerm',
        {
          searchLoginTerm: `%${searchLoginTerm}%`,
          searchEmailTerm: `%${searchEmailTerm}%`,
        },
      );
    } else if (searchLoginTerm) {
      query.where('users."login" ILIKE :searchLoginTerm', {
        searchLoginTerm: `%${searchLoginTerm}%`,
      });
    } else if (searchEmailTerm) {
      query.where('users."email" ILIKE :searchEmailTerm', {
        searchEmailTerm: `%${searchEmailTerm}%`,
      });
    } else {
      query.where('true');
    }

    if (isBanFilter) {
      query.andWhere('users.isBanned = :isBanned', {
        isBanned: banStatus === BanStatus.banned,
      });
    }

    const totalCount = await query.getCount();
    const users = await query
      .orderBy(`users.${sortBy}`, sortDirection === 'desc' ? 'DESC' : 'ASC')
      .limit(paginator.pageSize)
      .offset(paginator.skip)
      .getMany();

    const usersView = users.map((user) => this.userDBToUserView(user));
    return paginator.paginate(totalCount, usersView);
  }

  async getUserViewById(userId: number): Promise<ViewUserDto | null> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) return null;

    return this.userDBToUserView(user);
  }

  userDBToUserView(user: User): ViewUserDto {
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
}
