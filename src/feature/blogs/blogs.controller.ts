import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
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
import { AccessJwtAuthGuard } from '../auth/guard/jwt.guard';
import { ResultNotification } from '../../modules/notification';
import { CommandBus } from '@nestjs/cqrs';
import { SubscribeUserToBlogCommand } from './use-case/subscribe-user-to-blog.usecase';
import { UnsubscribeUserToBlogCommand } from './use-case/unsubscribe-user-to-blog.usecase';

@Controller('blogs')
export class BlogsController {
  private readonly logger = new Logger('Blogs');
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(AccessJwtAuthGuard)
  @Post(':blogId/subscription')
  @HttpCode(HttpStatus.NO_CONTENT)
  async subscribeUserToBlog(
    @Param('blogId', IdIntegerValidationPipe) blogId: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    const result: ResultNotification = await this.commandBus.execute(
      new SubscribeUserToBlogCommand(+blogId, +userId),
    );

    if (result.hasError()) {
      result.getResult();
    }
  }

  @UseGuards(AccessJwtAuthGuard)
  @Delete(':blogId/subscription')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsubscribeUserToBlog(
    @Param('blogId', IdIntegerValidationPipe) blogId: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    const result: ResultNotification = await this.commandBus.execute(
      new UnsubscribeUserToBlogCommand(+blogId, +userId),
    );

    if (result.hasError()) {
      result.getResult();
    }
  }

  @Get()
  async getBlogs(
    @Query() queryParams: QueryParams,
    @CurrentUserId(false) userId: string,
  ): Promise<PaginatorBlogSqlType> {
    const paginator = new PaginatorBlogSql(
      +queryParams.pageNumber,
      +queryParams.pageSize,
    );
    return this.blogsQueryRepository.getBlogs(queryParams, paginator, +userId);
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
    @CurrentUserId(false) userId: string,
  ): Promise<ViewBlogDto> {
    const blogView = await this.blogsQueryRepository.getBlogById(+id, +userId);
    if (!blogView) throw new NotFoundException('Blog not found');
    return blogView;
  }
}
