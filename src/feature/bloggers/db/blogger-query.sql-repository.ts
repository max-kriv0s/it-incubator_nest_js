import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  PaginatorBloggerBlogSql,
  PaginatorBloggerBlogSqlViewType,
  ViewBloggerBlogDto,
} from '../dto/view-blogger-blogs.dto';
import { BlogRawSqlDocument } from '../../../feature/blogs/model/blog-sql.model';
import { BloggerQueryParams } from '../dto/blogger-query-params.dto';

@Injectable()
export class BloggerQuerySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getBlogs(
    queryParams: BloggerQueryParams,
    userId: string,
    paginator: PaginatorBloggerBlogSql,
  ): Promise<PaginatorBloggerBlogSqlViewType> {
    const searchNameTerm: string = queryParams.searchNameTerm ?? '';
    const sortBy: string = queryParams.sortBy ?? 'createdAt';
    const sortDirection: string = queryParams.sortDirection ?? 'desc';

    const params = [+userId, `%${searchNameTerm}%`];
    const blogsCount: { count: number }[] = await this.dataSource.query(
      `SELECT count(*)
        FROM public."Blogs"
        WHERE "ownerId" = $1 AND "name" ILIKE $2`,
      params,
    );

    const totalCount = +blogsCount[0].count;
    const blogs: BlogRawSqlDocument[] = await this.dataSource.query(
      `SELECT *
        FROM public."Blogs"
        WHERE "ownerId" = $1 AND "name" ILIKE $2
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${paginator.pageSize} OFFSET ${paginator.skip}`,
      params,
    );
    const blogsView = blogs.map((blog) => this.blogDBToBlogView(blog));
    return paginator.paginate(totalCount, blogsView);
  }

  async getBlogById(id: string): Promise<ViewBloggerBlogDto | null> {
    const blogs: BlogRawSqlDocument[] = await this.dataSource.query(
      `SELECT *
        FROM public."Blogs"
        WHERE id = $1`,
      [+id],
    );
    if (!blogs.length) return null;
    return this.blogDBToBlogView(blogs[0]);
  }

  blogDBToBlogView(blog: BlogRawSqlDocument): ViewBloggerBlogDto {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  }
}
