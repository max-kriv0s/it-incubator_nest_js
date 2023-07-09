import { Injectable } from '@nestjs/common';
import { QueryParamsAllBlogs } from '../dto/query-all-blogs.dto';
import {
  PaginatorUsersBlogView,
  UsersBlogViewDto,
} from '../dto/users-blog-view-model.dto';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from '../../../feature/blogs/blog.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersBlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async getAllUsersBlogs(
    queryParams: QueryParamsAllBlogs,
  ): Promise<PaginatorUsersBlogView> {
    const searchNameTerm: string = queryParams.searchNameTerm ?? '';
    const pageNumber: number = queryParams.pageNumber
      ? +queryParams.pageNumber
      : 1;
    const pageSize: number = queryParams.pageSize ? +queryParams.pageSize : 10;
    const sortBy: string = queryParams.sortBy ?? 'createdAt';
    const sortDirection: string = queryParams.sortDirection ?? 'desc';
    const filter: any = {};

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }

    const totalCount: number = await this.BlogModel.countDocuments(filter);
    const skip = (pageNumber - 1) * pageSize;
    const blogs: BlogDocument[] = await this.BlogModel.find(filter, null, {
      sort: { [sortBy]: sortDirection === 'asc' ? 1 : -1 },
      skip: skip,
      limit: pageSize,
    }).exec();

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: await Promise.all(
        blogs.map((blog) => this.usersBlogDBToUsersBlogView(blog)),
      ),
    };
  }

  private async usersBlogDBToUsersBlogView(
    blog: BlogDocument,
  ): Promise<UsersBlogViewDto> {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
      blogOwnerInfo: {
        userId: blog.blogOwner.userId.toString(),
        userLogin: blog.blogOwner.userLogin,
      },
    };
  }
}
