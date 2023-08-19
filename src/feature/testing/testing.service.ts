import { Injectable } from '@nestjs/common';
import { UsersSqlRepository } from '../users/db/users.sql-repository';
import { SecurityDevicesSqlRepository } from '../security-devices/db/security-devices.sql-repository';
import { BlogsSqlRepository } from '../blogs/db/blogs.sql-repository';
import { PostsSqlRepository } from '../posts/db/posts.sql-repository';
import { BloggersSqlRepository } from '../bloggers/db/bloggers.sql-repository';
import { CommentsSqlRepository } from '../comments/db/comments.sql-repository';
import { LikePostsSqlRepository } from '../posts/db/like-posts.sql-repository';
import { LikeCommentsSqlRepository } from '../comments/db/like-comments.sql-repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TestingService {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
    private readonly likePostsSqlRepository: LikePostsSqlRepository,
    private readonly likeCommentsSqlRepository: LikeCommentsSqlRepository,
    private readonly bloggersSqlRepository: BloggersSqlRepository,
  ) {}

  async deleteAllData() {
    const userNameDB = this.configService.get('TYPE_ORM_USERNAME', 'postgres');
    await this.dataSource.query(
      `CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
      DECLARE
      statements CURSOR FOR
        SELECT tablename FROM pg_tables
        WHERE tableowner = username AND schemaname = 'public';

      BEGIN
        FOR stmt IN statements LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' RESTART IDENTITY CASCADE;';
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;

      SELECT truncate_tables('${userNameDB}')`,
    );
  }
}
