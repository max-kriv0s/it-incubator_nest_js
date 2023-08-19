import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ViewUserDto } from '../dto/view-user.dto';
import { Repository } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

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
