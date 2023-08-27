import { InjectRepository } from '@nestjs/typeorm';
import { BloggerBannedUser } from '../entities/blogger-banned-user.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class BloggersRepository {
  constructor(
    @InjectRepository(BloggerBannedUser)
    private readonly bloggersRepo: Repository<BloggerBannedUser>,
  ) {}

  async findBannedUserByBlogIdAndUserId(
    blogId: number,
    userId: number,
  ): Promise<BloggerBannedUser | null> {
    return this.bloggersRepo.findOneBy({
      blogId,
      bannedUserId: userId,
    });
  }

  createBloggerBannedUsers(
    bannedUser: BloggerBannedUser,
  ): Promise<BloggerBannedUser> {
    return this.bloggersRepo.save(bannedUser);
  }

  async save(bannedUser: BloggerBannedUser) {
    await this.bloggersRepo.save(bannedUser);
  }
}
