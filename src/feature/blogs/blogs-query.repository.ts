import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from './blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { PaginatorBlogView, ViewBlogDto } from './dto/view-blog.dto';
import { QueryParams } from '../../dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async getBlogs(queryParams: QueryParams): Promise<PaginatorBlogView> {
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
        blogs.map((blog) => this.blogDBToBlogView(blog)),
      ),
    };
  }

  async getBlogById(id: string): Promise<ViewBlogDto | null> {
    const blog = await this.BlogModel.findById(id).exec();
    if (!blog) return null;

    return this.blogDBToBlogView(blog);
  }

  async blogDBToBlogView(blog: BlogDocument): Promise<ViewBlogDto> {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  }
}
