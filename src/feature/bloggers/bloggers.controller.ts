import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessJwtAuthGuard } from '../auth/guard/jwt.guard';
import { UpdateBlogDto } from '../blogs/dto/update-blog.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateExistingBlogByIdCommand } from '../blogs/use-case/update-existing-blog-by-id.usecase';
import {
  ResultNotification,
  replyByNotification,
} from '../../modules/notification';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { IdValidationPipe } from '../../modules/pipes/id-validation.pipe';
import { DeleteBlogByIdCommand } from '../blogs/use-case/delete-blog-by-id.usecase';
import { CreateBlogDto } from '../blogs/dto/create-blog.dto';
import { CreateBlogCommand } from '../blogs/use-case/create-blog.usecase';
import { BloggerQueryParams } from './dto/blogger-query-params.dto';
import {
  PaginatorBloggerBlogSql,
  PaginatorBloggerBlogSqlViewType,
  PaginatorBloggerPostView,
  ViewBloggerBlogDto,
} from './dto/view-blogger-blogs.dto';
import { CreateBlogPostDto } from '../blogs/dto/create-blog-post.dto';
import { ViewPostDto } from '../posts/dto/view-post.dto';
import { CreatePostByBlogIdCommand } from '../blogs/use-case/create-post-by-blog-id.usecase';
import { BlogPostUpdateDto } from './dto/blog-post-update.dto';
import { UpdatePostByIdCommand } from './use-case/update-post-by-id.usecase';
import { DeletePostByIdCommand } from './use-case/delete-post-by-id.usecase';
import { PaginatorViewBloggerCommentsDto } from './dto/view-blogger-comments.dto';
import { IdIntegerValidationPipe } from 'src/modules/pipes/id-integer-validation.pipe';
import { BloggerQuerySqlRepository } from './db/blogger-query.sql-repository';

@UseGuards(AccessJwtAuthGuard)
@Controller('blogger/blogs')
export class BloggersController {
  constructor(
    private commandBus: CommandBus,
    private readonly bloggerQuerySqlRepository: BloggerQuerySqlRepository,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateExistingBlogById(
    @Param('id', IdIntegerValidationPipe) id: string,
    @Body() updateDto: UpdateBlogDto,
    @CurrentUserId() userId: string,
  ) {
    const updateResult: ResultNotification = await this.commandBus.execute(
      new UpdateExistingBlogByIdCommand(+id, updateDto, userId),
    );
    if (updateResult.hasError()) updateResult.getResult();
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBlog(
    @Param('id', IdIntegerValidationPipe) id: string,
    @CurrentUserId() userId: string,
  ) {
    const deletionResult: ResultNotification = await this.commandBus.execute(
      new DeleteBlogByIdCommand(id, userId),
    );
    if (deletionResult.hasError()) deletionResult.getResult();
  }

  @Post()
  async createBlog(
    @Body() createDto: CreateBlogDto,
    @CurrentUserId() userId: string,
  ): Promise<ViewBloggerBlogDto> {
    const creationResult: ResultNotification<string> =
      await this.commandBus.execute(new CreateBlogCommand(createDto, userId));
    const blogId = creationResult.getResult();
    if (!blogId) throw new BadRequestException();

    const blogView = await this.bloggerQuerySqlRepository.getBlogById(blogId);
    if (!blogView) throw new NotFoundException('Blog not found');
    return blogView;
  }

  @Get()
  async getBlogs(
    @Query() queryParams: BloggerQueryParams,
    @CurrentUserId() userId: string,
  ): Promise<PaginatorBloggerBlogSqlViewType> {
    const paginator = new PaginatorBloggerBlogSql(
      +queryParams.pageNumber,
      +queryParams.pageSize,
    );

    return this.bloggerQuerySqlRepository.getBlogs(
      queryParams,
      userId,
      paginator,
    );
  }

  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId', IdIntegerValidationPipe) blogId: string,
    @Body() createPostDto: CreateBlogPostDto,
    @CurrentUserId(false) userId: string,
  ): Promise<ViewPostDto> {
    const result = await this.commandBus.execute(
      new CreatePostByBlogIdCommand(blogId, createPostDto, userId),
    );
    const postId = replyByNotification(result);
    const postView = await this.bloggerSqlQueryRepository.getPostById(
      postId,
      userId,
    );
    if (!postView) throw new NotFoundException('Post not found');
    return postView;
  }

  @Get(':blogId/posts')
  async findPostsByBlogId(
    @Param('blogId', IdValidationPipe) blogId: string,
    @Query() queryParams: BloggerQueryParams,
    @CurrentUserId(false) userId: string,
  ): Promise<PaginatorBloggerPostView> {
    const result = await this.bloggerQueryRepository.findPostsByBlogId(
      blogId,
      queryParams,
      userId,
    );

    const postsView = replyByNotification<PaginatorBloggerPostView>(result);
    if (!postsView) throw new NotFoundException('Post not found');
    return postsView;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':blogId/posts/:postId')
  async updatePostById(
    @Param('blogId', IdValidationPipe) blogId: string,
    @Param('postId', IdValidationPipe) postId: string,
    @Body() updateDto: BlogPostUpdateDto,
    @CurrentUserId() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new UpdatePostByIdCommand(blogId, postId, updateDto, userId),
    );
    return replyByNotification(result);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':blogId/posts/:postId')
  async deletePostById(
    @Param('blogId', IdValidationPipe) blogId: string,
    @Param('postId', IdValidationPipe) postId: string,
    @CurrentUserId() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new DeletePostByIdCommand(blogId, postId, userId),
    );
    return replyByNotification(result);
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('comments')
  async allCommentsForAllPostsInsideBlogs(
    @Query() queryParams: BloggerQueryParams,
    @CurrentUserId() userId: string,
  ): Promise<PaginatorViewBloggerCommentsDto> {
    return await this.bloggerQueryRepository.allCommentsForAllPostsInsideBlogs(
      queryParams,
      userId,
    );
  }
}
