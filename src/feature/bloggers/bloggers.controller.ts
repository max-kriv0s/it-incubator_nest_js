import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
  PaginatorBloggerBlogView,
  PaginatorBloggerPostView,
  ViewBloggerBlogDto,
} from './dto/view-blogger-blogs.dto';
import { BloggerQueryRepository } from './db/blogger-query.repository';
import { CreateBlogPostDto } from '../blogs/dto/create-blog-post.dto';
import { ViewPostDto } from '../posts/dto/view-post.dto';
import { CreatePostByBlogIdCommand } from '../blogs/use-case/create-post-by-blog-id.usecase';
import { BlogPostUpdateDto } from './dto/blog-post-update.dto';
import { UpdatePostByIdCommand } from './use-case/update-post-by-id.usecase';
import { DeletePostByIdCommand } from './use-case/delete-post-by-id.usecase';
import { PaginatorViewBloggerCommentsDto } from './dto/view-blogger-comments.dto';
import { BloggerBanUserInputDto } from './dto/blogger-ban-user-input.dto';
import { BloggerBanUnbanUserCommand } from './use-case/blogger-ban-unban-user.usecase';
import { GetFieldError } from '../../utils';
import { BloggerBannedUsersQueryParams } from './dto/blogger-banned-users-query-param.dto';

@UseGuards(AccessJwtAuthGuard)
@Controller('blogger/blogs')
export class BloggersController {
  constructor(
    private commandBus: CommandBus,
    private readonly bloggerQueryRepository: BloggerQueryRepository,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateExistingBlogById(
    @Param('id', IdValidationPipe) id: string,
    @Body() updateDto: UpdateBlogDto,
    @CurrentUserId() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new UpdateExistingBlogByIdCommand(id, updateDto, userId),
    );
    return replyByNotification(result);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBlog(
    @Param('id', IdValidationPipe) id: string,
    @CurrentUserId() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new DeleteBlogByIdCommand(id, userId),
    );

    return replyByNotification(result);
  }

  @Post()
  async createBlog(
    @Body() createDto: CreateBlogDto,
    @CurrentUserId() userId: string,
  ): Promise<ViewBloggerBlogDto> {
    const result = await this.commandBus.execute(
      new CreateBlogCommand(createDto, userId),
    );
    const blogId = replyByNotification(result);

    const blogView = await this.bloggerQueryRepository.getBlogById(blogId);
    if (!blogView) throw new NotFoundException('Blog not found');
    return blogView;
  }

  @Get()
  async getBlogs(
    @Query() queryParams: BloggerQueryParams,
    @CurrentUserId() userId: string,
  ): Promise<PaginatorBloggerBlogView> {
    return this.bloggerQueryRepository.getBlogs(queryParams, userId);
  }

  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId', IdValidationPipe) blogId: string,
    @Body() createPostDto: CreateBlogPostDto,
    @CurrentUserId(false) userId: string,
  ): Promise<ViewPostDto> {
    const result = await this.commandBus.execute(
      new CreatePostByBlogIdCommand(blogId, createPostDto, userId),
    );
    const postId = replyByNotification(result);
    const postView = await this.bloggerQueryRepository.getPostById(
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

@UseGuards(AccessJwtAuthGuard)
@Controller('blogger/users')
export class BloggersUsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly bloggerQueryRepository: BloggerQueryRepository,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/ban')
  async BanUnbanUser(
    @CurrentUserId() userId: string,
    @Param('id', IdValidationPipe) bannedUserId: string,
    @Body() banUserInputDto: BloggerBanUserInputDto,
  ) {
    const result: ResultNotification<null> = await this.commandBus.execute(
      new BloggerBanUnbanUserCommand(userId, bannedUserId, banUserInputDto),
    );

    if (result.hasError()) {
      replyByNotification(result);
      // const error = result.getError();
      // throw new BadRequestException([
      //   GetFieldError(error.message, error.field),
      // ]);
    }
    return;
  }

  @Get('blog/:id')
  async getAllBannedUsersForBlog(
    @Param('id', IdValidationPipe) id: string,
    @Query() queryParam: BloggerBannedUsersQueryParams,
    @CurrentUserId() userId: string,
  ) {
    return await this.bloggerQueryRepository.getAllBannedUsersForBlog(
      id,
      userId,
      queryParam,
    );
  }
}
