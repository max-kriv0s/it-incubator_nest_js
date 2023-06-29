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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from './blogs-query.repository';
import { ParamBlogIdDto, ParamIdDto, QueryParams } from '../../dto';
import { PaginatorBlogView, ViewBlogDto } from './dto/view-blog.dto';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PaginatorPostView, ViewPostDto } from '../posts/dto/view-post.dto';
import { PostsQueryRepository } from '../posts/posts-query.repository';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { BasicAuthGuard } from 'src/feature/auth/guard/basic-auth.guard';

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
    @Param() params: ParamBlogIdDto,
    @Query() queryParams: QueryParams,
  ): Promise<PaginatorPostView> {
    const postsView = await this.postsQueryRepository.findPostsByBlogId(
      params.blogId,
      queryParams,
      // req.userId,
    );
    if (!postsView) throw new NotFoundException('Blog not found');

    return postsView;
  }

  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param() params: ParamBlogIdDto,
    @Body() blogPostDto: CreateBlogPostDto,
  ): Promise<ViewPostDto> {
    const postId = await this.blogsService.createPostByBlogId(
      params.blogId,
      blogPostDto,
    );
    if (!postId) throw new NotFoundException('Blog not found');

    return this.postsQueryRepository.getPostById(
      postId,
      // req.userId,
    );
  }

  @Get(':id')
  async getBlogById(@Param() params: ParamIdDto): Promise<ViewBlogDto> {
    const blogView = await this.blogsQueryRepository.getBlogById(params.id);
    if (!blogView) throw new NotFoundException('Blog not found');
    return blogView;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param() params: ParamIdDto,
    @Body() blogDto: UpdateBlogDto,
  ) {
    const isUpdated = await this.blogsService.updateBlog(params.id, blogDto);
    if (!isUpdated) throw new NotFoundException('Blog not found');
    return isUpdated;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param() params: ParamIdDto) {
    const isDeleted = await this.blogsService.deleteBlogById(params.id);
    if (!isDeleted) throw new NotFoundException('Blog not found');
    return isDeleted;
  }
}
