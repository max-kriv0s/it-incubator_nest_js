import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from './blogs-query.repository';
import { QueryParams } from '../../dto';
import { PaginatorBlogView, ViewBlogDto } from './dto/view-blog.dto';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { PaginatorPostView, ViewPostDto } from '../posts/dto/view-post.dto';
import { PostsQueryRepository } from '../posts/posts-query.repository';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { BasicAuthGuard } from '../../feature/auth/guard/basic-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { IdValidationPipe } from '../../modules/pipes/id-validation.pipe';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsService: BlogsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getBlogs(
    @Query() queryParams: QueryParams,
  ): Promise<PaginatorBlogView> {
    return this.blogsQueryRepository.getBlogs(queryParams);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() blogDto: CreateBlogDto): Promise<ViewBlogDto> {
    const blogId = await this.blogsService.createBlog(blogDto);

    const blogView = await this.blogsQueryRepository.getBlogById(blogId);
    if (!blogView) throw new InternalServerErrorException('Blog not created');

    return blogView;
  }

  @Get(':blogId/posts')
  async findPostsByBlogId(
    @Param('blogId', IdValidationPipe) blogId: string,
    @Query() queryParams: QueryParams,
    @CurrentUserId(false) userId: string,
  ): Promise<PaginatorPostView> {
    const postsView = await this.postsQueryRepository.findPostsByBlogId(
      blogId,
      queryParams,
      userId,
    );
    if (!postsView) throw new NotFoundException('Blog not found');

    return postsView;
  }

  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId', IdValidationPipe) blogId: string,
    @Body() blogPostDto: CreateBlogPostDto,
    @CurrentUserId(false) userId: string,
  ): Promise<ViewPostDto> {
    const postId = await this.blogsService.createPostByBlogId(
      blogId,
      blogPostDto,
    );
    if (!postId) throw new NotFoundException('Blog not found');

    return this.postsQueryRepository.getPostById(postId, userId);
  }

  @Get(':id')
  async getBlogById(
    @Param('id', IdValidationPipe) id: string,
  ): Promise<ViewBlogDto> {
    const blogView = await this.blogsQueryRepository.getBlogById(id);
    if (!blogView) throw new NotFoundException('Blog not found');
    return blogView;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id', IdValidationPipe) id: string) {
    const isDeleted = await this.blogsService.deleteBlogById(id);
    if (!isDeleted) throw new NotFoundException('Blog not found');
    return isDeleted;
  }
}
