import {
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
} from '@nestjs/common';
import { BlogsQueryRepository } from './blogs-query.repository';
import { QueryParams } from '../dto';
import { PaginatorBlogView, ViewBlogDto } from './dto/view-blog.dto';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PaginatorPostView, ViewPostDto } from '../posts/dto/view-post.dto';
import { PostsQueryRepository } from '../posts/posts-query.repository';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';

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

  @Post()
  async createBlog(@Body() blogDto: CreateBlogDto): Promise<ViewBlogDto> {
    const blogId = await this.blogsService.createBlog(blogDto);
    return this.blogsQueryRepository.getBlogById(blogId);
  }

  @Get(':blogId/posts')
  async findPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() queryParams: QueryParams,
  ): Promise<PaginatorPostView> {
    return this.postsQueryRepository.findPostsByBlogId(
      blogId,
      queryParams,
      // req.userId,
    );
  }

  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() blogPostDto: CreateBlogPostDto,
  ): Promise<ViewPostDto> {
    const postId = await this.blogsService.createPostByBlogId(
      blogId,
      blogPostDto,
    );
    if (!postId) throw new NotFoundException('Blog not found');

    return this.postsQueryRepository.getPostById(
      postId,
      // req.userId,
    );
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<ViewBlogDto> {
    return await this.blogsQueryRepository.getBlogById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() blogDto: UpdateBlogDto) {
    return this.blogsService.updateBlog(id, blogDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    return this.blogsService.deleteBlogById(id);
  }
}
