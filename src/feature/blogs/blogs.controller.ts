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
import { BlogsService } from './blogs.service';
import {
  PaginatorPostSql,
  PaginatorPostSqlType,
} from '../posts/dto/view-post.dto';
import { PostsQueryRepository } from '../posts/db/posts-query.repository';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { BlogsQuerySqlRepository } from './db/blogs-query.sql-repository';
import { IdIntegerValidationPipe } from '../../modules/pipes/id-integer-validation.pipe';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQuerySqlRepository: BlogsQuerySqlRepository,
    private readonly blogsService: BlogsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getBlogs(
    @Query() queryParams: QueryParams,
  ): Promise<PaginatorBlogSqlType> {
    const paginator = new PaginatorBlogSql(
      +queryParams.pageNumber,
      +queryParams.pageSize,
    );
    return this.blogsQuerySqlRepository.getBlogs(queryParams, paginator);
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

    const postsView = await this.blogsQuerySqlRepository.findPostsByBlogId(
      blogId,
      queryParams,
      paginator,
      userId,
    );
    if (!postsView) throw new NotFoundException('Blog not found');
    return postsView;
  }

  @Get(':id')
  async getBlogById(
    @Param('id', IdIntegerValidationPipe) id: string,
  ): Promise<ViewBlogDto> {
    const blogView = await this.blogsQuerySqlRepository.getBlogById(id);
    if (!blogView) throw new NotFoundException('Blog not found');
    return blogView;
  }
}
