import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AccessJwtAuthGuard } from '../auth/guard/jwt.guard';
import { UpdateBlogDto } from '../blogs/dto/update-blog.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateExistingBlogByIdCommand } from '../blogs/use-case/update-existing-blog-by-id.usecase';
import { ResultNotification } from '../../modules/notification';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { DeleteBlogByIdCommand } from '../blogs/use-case/delete-blog-by-id.usecase';
import { CreateBlogDto } from '../blogs/dto/create-blog.dto';
import { CreateBlogCommand } from '../blogs/use-case/create-blog.usecase';
import { BloggerQueryParams } from './dto/blogger-query-params.dto';
import {
  PaginatorBloggerBlogSql,
  PaginatorBloggerBlogSqlViewType,
  PaginatorBloggerPostSql,
  PaginatorBloggerpostSqlViewType,
  ViewBloggerBlogDto,
} from './dto/view-blogger-blogs.dto';
import { CreateBlogPostDto } from '../blogs/dto/create-blog-post.dto';
import { ViewPostDto } from '../posts/dto/view-post.dto';
import { CreatePostByBlogIdCommand } from '../blogs/use-case/create-post-by-blog-id.usecase';
import { BlogPostUpdateDto } from './dto/blog-post-update.dto';
import { UpdatePostByIdCommand } from './use-case/update-post-by-id.usecase';
import { DeletePostByIdCommand } from './use-case/delete-post-by-id.usecase';
import {
  PaginatorBloggerCommentsSql,
  PaginatorViewBloggerCommentsDto,
} from './dto/view-blogger-comments.dto';
import { IdIntegerValidationPipe } from '../../modules/pipes/id-integer-validation.pipe';
import { BloggerQueryRepository } from './db/blogger-query.repository';
import { BloggerQuerySqlRepository } from './db/blogger-query.sql-repository';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadWallpaperForBlogCommand } from '../blogs/use-case/upload-wallpaper- for-blog.usecase';
import { BlogsQueryRepository } from '../blogs/db/blogs-query.repository';
import { BlogImageView } from '../blogs/dto/blog-image-view.dto';
import { ImageInputDto } from '../../modules/dto/image-input.dto';
import { UploadMainSquareImageForBlogCommand } from '../blogs/use-case/upload-main-square-image-for-blog.usecase';
import { UploadMainImageForPostCommand } from '../posts/use-case/upload-main-iImage-for-post';
import { PostsQueryRepository } from '../posts/db/posts-query.repository';
import { PostImageView } from '../posts/dto/post-image-view.dto';

@UseGuards(AccessJwtAuthGuard)
@Controller('blogger/blogs')
export class BloggersController {
  private readonly logger = new Logger('Blogger');
  constructor(
    private commandBus: CommandBus,
    private readonly bloggerQueryRepository: BloggerQueryRepository,
    private readonly bloggerQuerySqlRepository: BloggerQuerySqlRepository,
    private readonly blogQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId', IdIntegerValidationPipe) blogId: string,
    @Body() createPostDto: CreateBlogPostDto,
    @CurrentUserId() userId: string,
  ): Promise<ViewPostDto> {
    this.logger.log('create post');

    const creationResult: ResultNotification<number> =
      await this.commandBus.execute(
        new CreatePostByBlogIdCommand(+blogId, createPostDto, +userId),
      );
    const postId = creationResult.getResult();
    const postView = await this.bloggerQueryRepository.getPostById(
      postId!,
      +userId,
    );
    if (!postView) throw new NotFoundException('Post not found');
    return postView;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateExistingBlogById(
    @Param('id', IdIntegerValidationPipe) id: string,
    @Body() updateDto: UpdateBlogDto,
    @CurrentUserId() userId: string,
  ) {
    const updateResult: ResultNotification = await this.commandBus.execute(
      new UpdateExistingBlogByIdCommand(+id, updateDto, +userId),
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
      new DeleteBlogByIdCommand(+id, +userId),
    );
    if (deletionResult.hasError()) deletionResult.getResult();
  }

  @Post()
  async createBlog(
    @Body() createDto: CreateBlogDto,
    @CurrentUserId() userId: string,
  ): Promise<ViewBloggerBlogDto> {
    const creationResult: ResultNotification<number> =
      await this.commandBus.execute(new CreateBlogCommand(createDto, +userId));
    const blogId = creationResult.getResult();
    if (!blogId) throw new BadRequestException();

    const blogView = await this.bloggerQueryRepository.getBlogById(
      blogId,
      +userId,
    );
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

    return this.bloggerQueryRepository.getBlogs(
      queryParams,
      +userId,
      paginator,
    );
  }

  @Get(':blogId/posts')
  async findPostsByBlogId(
    @Param('blogId', IdIntegerValidationPipe) blogId: string,
    @Query() queryParams: BloggerQueryParams,
    @CurrentUserId(false) userId: string,
  ): Promise<PaginatorBloggerpostSqlViewType> {
    const paginator = new PaginatorBloggerPostSql(
      +queryParams.pageNumber,
      +queryParams.pageSize,
    );

    const result: ResultNotification<PaginatorBloggerpostSqlViewType> =
      await this.bloggerQueryRepository.findPostsByBlogId(
        +blogId,
        queryParams,
        +userId,
        paginator,
      );

    const postsView = result.getResult();
    if (!postsView) throw new NotFoundException('Post not found');
    return postsView;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':blogId/posts/:postId')
  async updatePostById(
    @Param('blogId', IdIntegerValidationPipe) blogId: string,
    @Param('postId', IdIntegerValidationPipe) postId: string,
    @Body() updateDto: BlogPostUpdateDto,
    @CurrentUserId() userId: string,
  ) {
    const result: ResultNotification<boolean> = await this.commandBus.execute(
      new UpdatePostByIdCommand(+blogId, +postId, updateDto, +userId),
    );
    return result.getResult();
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':blogId/posts/:postId')
  async deletePostById(
    @Param('blogId', IdIntegerValidationPipe) blogId: string,
    @Param('postId', IdIntegerValidationPipe) postId: string,
    @CurrentUserId() userId: string,
  ) {
    const result: ResultNotification<null> = await this.commandBus.execute(
      new DeletePostByIdCommand(+blogId, +postId, +userId),
    );
    return result.getResult();
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('comments')
  async allCommentsForAllPostsInsideBlogs(
    @Query() queryParams: BloggerQueryParams,
    @CurrentUserId() userId: string,
  ): Promise<PaginatorViewBloggerCommentsDto> {
    const paginator = new PaginatorBloggerCommentsSql(
      +queryParams.pageNumber,
      +queryParams.pageSize,
    );

    return await this.bloggerQueryRepository.allCommentsForAllPostsInsideBlogs(
      queryParams,
      +userId,
      paginator,
    );
  }

  @Post(':blogId/images/wallpaper')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBackgroundWallpaperForBlog(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 100 * 1024 })],
        fileIsRequired: true,
        exceptionFactory: (error) => {
          throw new BadRequestException([{ message: error, field: 'file' }]);
        },
      }),
    )
    wallpaperFile: Express.Multer.File,
    @CurrentUserId() userId: string,
    @Param('blogId', IdIntegerValidationPipe) blogId: string,
  ): Promise<BlogImageView> {
    const imageInput: ImageInputDto = {
      originalName: wallpaperFile.originalname,
      buffer: wallpaperFile.buffer,
      mimetype: wallpaperFile.mimetype,
    };

    const result: ResultNotification = await this.commandBus.execute(
      new UploadWallpaperForBlogCommand(+userId, +blogId, imageInput),
    );

    result.getResult();
    return this.blogQueryRepository.blogImageView(+blogId);
  }

  @Post(':blogId/images/main')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMainSquareImageForBlog(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 100 * 1024 })],
        fileIsRequired: true,
        exceptionFactory: (error) => {
          throw new BadRequestException([{ message: error, field: 'file' }]);
        },
      }),
    )
    mainFile: Express.Multer.File,
    @CurrentUserId() userId: string,
    @Param('blogId', IdIntegerValidationPipe) blogId: string,
  ): Promise<BlogImageView> {
    const imageInput: ImageInputDto = {
      originalName: mainFile.originalname,
      buffer: mainFile.buffer,
      mimetype: mainFile.mimetype,
    };

    if (!mainFile.mimetype.includes('image')) {
      throw new BadRequestException([
        { message: 'incorrect format', field: 'file' },
      ]);
    }

    const result: ResultNotification = await this.commandBus.execute(
      new UploadMainSquareImageForBlogCommand(+userId, +blogId, imageInput),
    );

    result.getResult();
    return this.blogQueryRepository.blogImageView(+blogId);
  }

  @Post(':blogId/posts/:postId/images/main')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMainImageForPost(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 100 * 1024 })],
        fileIsRequired: true,
        exceptionFactory: (error) => {
          throw new BadRequestException([{ message: error, field: 'file' }]);
        },
      }),
    )
    mainFile: Express.Multer.File,
    @CurrentUserId() userId: string,
    @Param('blogId', IdIntegerValidationPipe) blogId: string,
    @Param('postId', IdIntegerValidationPipe) postId: string,
  ): Promise<PostImageView> {
    const imageInput: ImageInputDto = {
      originalName: mainFile.originalname,
      buffer: mainFile.buffer,
      mimetype: mainFile.mimetype,
    };

    if (!mainFile.mimetype.includes('image')) {
      throw new BadRequestException([
        { message: 'incorrect format', field: 'file' },
      ]);
    }

    const result: ResultNotification = await this.commandBus.execute(
      new UploadMainImageForPostCommand(+userId, +blogId, +postId, imageInput),
    );

    result.getResult();
    return this.postsQueryRepository.postImagesView(+postId);
  }
}
