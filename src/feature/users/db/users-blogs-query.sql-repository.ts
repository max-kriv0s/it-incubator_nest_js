import { Injectable } from '@nestjs/common';
import { QueryParamsAllBlogs } from '../dto/query-all-blogs.dto';
import {
  PaginatorUsersBlogSql,
  PaginatorUsersBlogSqlType,
  UsersBlogViewDto,
} from '../dto/users-blog-view-model.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserBlogRawSqlDocument } from '../../../feature/blogs/model/blog-sql.model';

@Injectable()
export class UsersBlogsQuerySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAllUsersBlogs(
    queryParams: QueryParamsAllBlogs,
    paginator: PaginatorUsersBlogSql,
  ): Promise<PaginatorUsersBlogSqlType> {
    const searchNameTerm: string = queryParams.searchNameTerm ?? '';
    const sortBy: string = queryParams.sortBy ?? 'createdAt';
    const sortDirection: string = queryParams.sortDirection ?? 'desc';

    const params = [`%${searchNameTerm}%`];
    const blogsCount: { count: number } = await this.dataSource.query(
      `SELECT count(*)
      FROM public."Blogs"
      WHERE "name" ILIKE $1`,
      params,
    );

    const totalCount = +blogsCount[0].count;
    const blogsRaw: UserBlogRawSqlDocument[] = await this.dataSource.query(
      `SELECT "blogs".*, "users".login as ownerLogin
      FROM public."Blogs" as "blogs"
        LEFT JOIN public."Users" as "users"
          ON "blogs"."ownerId" = "users"."id"
      WHERE "name" ILIKE $1
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT ${paginator.pageSize} OFFSET ${paginator.skip}`,
      params,
    );
    const blogsView = blogsRaw.map((blog) =>
      this.usersBlogDBToUsersBlogView(blog),
    );
    return paginator.paginate(totalCount, blogsView);
  }

  private usersBlogDBToUsersBlogView(
    blog: UserBlogRawSqlDocument,
  ): UsersBlogViewDto {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
      blogOwnerInfo: {
        userId: blog.ownerId.toString(),
        userLogin: blog.ownerLogin,
      },
      banInfo: {
        isBanned: blog.isBanned,
        banDate: blog.banDate ? blog.banDate.toISOString() : null,
      },
    };
  }
}
