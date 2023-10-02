import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../../feature/blogs/entities/blog.entity';
import { QueryParamsAllBlogs } from '../dto/query-all-blogs.dto';
import {
  PaginatorUsersBlogSql,
  PaginatorUsersBlogSqlType,
  UsersBlogViewDto,
} from '../dto/users-blog-view-model.dto';
import { Repository } from 'typeorm';

@Injectable()
export class UsersBlogsQueryRepository {
  constructor(
    @InjectRepository(Blog) private readonly repository: Repository<Blog>,
  ) {}

  async getAllUsersBlogs(
    queryParams: QueryParamsAllBlogs,
    paginator: PaginatorUsersBlogSql,
  ): Promise<PaginatorUsersBlogSqlType> {
    const searchNameTerm: string = queryParams.searchNameTerm ?? '';
    const sortBy: string = queryParams.sortBy ?? 'createdAt';
    const sortDirection: string = queryParams.sortDirection ?? 'desc';

    const [userBlogs, totalCount] = await this.repository
      .createQueryBuilder('blogs')
      .leftJoin('blogs.owner', 'owner')
      .addSelect('owner.login')
      .where('blogs."name" ILIKE :searchNameTerm', {
        searchNameTerm: `%${searchNameTerm}%`,
      })
      .orderBy(`blogs.${sortBy}`, sortDirection === 'desc' ? 'DESC' : 'ASC')
      .limit(paginator.pageSize)
      .offset(paginator.skip)
      .getManyAndCount();

    const userBlogsView = userBlogs.map((blog) =>
      this.usersBlogDBToUsersBlogView(blog),
    );
    return paginator.paginate(totalCount, userBlogsView);
  }

  private usersBlogDBToUsersBlogView(userBlog: any): UsersBlogViewDto {
    return {
      id: userBlog.id.toString(),
      name: userBlog.name,
      description: userBlog.description,
      websiteUrl: userBlog.websiteUrl,
      createdAt: userBlog.createdAt.toISOString(),
      isMembership: userBlog.isMembership,
      blogOwnerInfo: {
        userId: userBlog.ownerId.toString(),
        userLogin: userBlog.owner.login,
      },
      // banInfo: {
      //   isBanned: userBlog.isBanned,
      //   banDate: userBlog.banDate ? userBlog.banDate.toISOString() : null,
      // },
    };
  }
}
