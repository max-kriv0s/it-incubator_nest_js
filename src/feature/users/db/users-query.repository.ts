import { Injectable } from '@nestjs/common';
import { BanStatus, QueryUserDto } from '../dto/query-user.dto';
import { PaginatorUserView, ViewUserDto } from '../dto/view-user.dto';
import { User, UserDocument, UserModelType } from '../user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ViewMeDto } from '../../auth/dto/view-me.dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async getAllUsersView(queryParams: QueryUserDto): Promise<PaginatorUserView> {
    const banStatus = queryParams.banStatus ?? BanStatus.all;
    const pageNumber = +queryParams.pageNumber || 1;
    const pageSize = +queryParams.pageSize || 10;
    const sortBy = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';
    const searchLoginTerm = queryParams.searchLoginTerm;
    const searchEmailTerm = queryParams.searchEmailTerm;

    const filterOr: any[] = [];
    if (searchLoginTerm) {
      filterOr.push({
        'accountData.login': { $regex: searchLoginTerm, $options: 'i' },
      });
    }

    if (searchEmailTerm) {
      filterOr.push({
        'accountData.email': { $regex: searchEmailTerm, $options: 'i' },
      });
    }

    let filter: any = {};
    if (filterOr.length > 0) filter = { $or: filterOr };

    if (banStatus !== BanStatus.all) {
      filter['banInfo.isBanned'] = banStatus === BanStatus.banned;
    }

    const totalCount: number = await this.UserModel.countDocuments(filter);
    const skip = (pageNumber - 1) * pageSize;

    const users: UserDocument[] = await this.UserModel.find(filter, null, {
      sort: { ['accountData.' + sortBy]: sortDirection === 'asc' ? 1 : -1 },
      skip: skip,
      limit: pageSize,
    }).exec();

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: await Promise.all(users.map((i) => this.userDBToUserView(i))),
    };
  }

  async getUserViewById(id: string): Promise<ViewUserDto | null> {
    const user = await this.UserModel.findById(id).exec();
    if (!user) return null;

    return this.userDBToUserView(user);
  }

  async userDBToUserView(user: UserDocument): Promise<ViewUserDto> {
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt.toISOString(),
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banDate: user.banInfo.banDate.toISOString(),
        banReason: user.banInfo.banReason,
      },
    };
  }

  async getMeView(id: string): Promise<ViewMeDto | null> {
    const userDB = await this.UserModel.findById(id);
    if (!userDB) return null;

    return {
      email: userDB.accountData.email,
      login: userDB.accountData.login,
      userId: id,
    };
  }
}
