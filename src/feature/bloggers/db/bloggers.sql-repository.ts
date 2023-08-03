import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BloggerBanUserInputDto } from '../dto/blogger-ban-user-input.dto';
import {
  BloggerBannedUsersRawSqlDocument,
  BloggerBannedUsersSqlDocument,
  convertBloggerBannedUsersRawToSql,
} from '../model/blogger-banned-users-sql.model';

@Injectable()
export class BloggersSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findBannedUserByBlogIdAndUserId(
    blogId: string,
    userId: string,
  ): Promise<BloggerBannedUsersSqlDocument | null> {
    const bannedUserRaw: BloggerBannedUsersRawSqlDocument[] =
      await this.dataSource.query(
        `SELECT *
        FROM public."BloggerBannedUsers"
        WHERE "blogId" = $1 AND "bannedUserId" = $2`,
        [+blogId, +userId],
      );

    if (!bannedUserRaw.length) return null;
    return convertBloggerBannedUsersRawToSql(bannedUserRaw[0]);
  }

  async createBloggerBannedUsers(
    userId: string,
    blogId: string,
  ): Promise<BloggerBannedUsersSqlDocument> {
    const bannedUserRaw: BloggerBannedUsersRawSqlDocument =
      await this.dataSource.query(
        `INSERT INTO public."BloggerBannedUsers"
        ("blogId", "bannedUserId")
        VALUES
        ($1, $2)
        RETURNING *`,
        [+blogId, +userId],
      );

    return convertBloggerBannedUsersRawToSql(bannedUserRaw[0]);
  }

  async updateBannedUser(id: string, banUserInputDto: BloggerBanUserInputDto) {
    const banDate = banUserInputDto.isBanned ? new Date() : null;
    const banReason = banUserInputDto.isBanned
      ? banUserInputDto.banReason
      : null;

    await this.dataSource.query(
      `UPDATE public."BloggerBannedUsers"
        SET "isBanned" = $2, "banDate" = $3, "banReason" = $4
        WHERE "id" = $1`,
      [+id, banUserInputDto.isBanned, banDate, banReason],
    );
  }

  async deleteBloggerBannedUsers() {
    await this.dataSource.query(`DELETE FROM public."BloggerBannedUsers"`);
  }
}
