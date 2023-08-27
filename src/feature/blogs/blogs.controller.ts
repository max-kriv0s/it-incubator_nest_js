import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { QueryParams } from '../../dto';
import {
  PaginatorBlogSql,
  PaginatorBlogSqlType,
  ViewBlogDto,
} from './dto/view-blog.dto';
import {
  PaginatorPostSql,
  PaginatorPostSqlType,
} from '../posts/dto/view-post.dto';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { IdIntegerValidationPipe } from '../../modules/pipes/id-integer-validation.pipe';
import { BlogsQueryRepository } from './db/blogs-query.repository';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  @Get()
  async getBlogs(
    @Query() queryParams: QueryParams,
  ): Promise<PaginatorBlogSqlType> {
    const paginator = new PaginatorBlogSql(
      +queryParams.pageNumber,
      +queryParams.pageSize,
    );
    return this.blogsQueryRepository.getBlogs(queryParams, paginator);
  }

  @Get(':blogId/posts')
  async findPostsByBlogId(
    @Param('blogId', IdIntegerValidationPipe) blogId: string,
    @Query() queryParams: QueryParams,
    @CurrentUserId(false) userId: string,
  ): Promise<PaginatorPostSqlType> {
    const paginator = new PaginatorPostSql(
      +queryParams.pageNumber,
      +queryParams.pageSize,
    );

    const postsView = await this.blogsQueryRepository.findPostsByBlogId(
      +blogId,
      queryParams,
      paginator,
      +userId,
    );
    if (!postsView) throw new NotFoundException('Blog not found');
    return postsView;
  }

  @Get(':id')
  async getBlogById(
    @Param('id', IdIntegerValidationPipe) id: string,
  ): Promise<ViewBlogDto> {
    const blogView = await this.blogsQueryRepository.getBlogById(+id);
    if (!blogView) throw new NotFoundException('Blog not found');
    return blogView;
  }
}
