import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BlogsQueryRepository } from './blogs-query.repository';
import { QueryParams } from 'src/dto';
import { PaginatorBlogView, ViewBlogDto } from './dto/view-blog.dto';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { calcResultDto } from 'src/utils';
import { PaginatorPostView, ViewPostDto } from 'src/posts/dto/view-post.dto';
import { PostsQueryRepository } from 'src/posts/posts-query.repository';
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
    const createdBlog = await this.blogsService.createBlog(blogDto);

    const result = await this.blogsQueryRepository.getBlogById(createdBlog._id);

    return calcResultDto<ViewBlogDto>(
      result.code,
      result.data as ViewBlogDto,
      result.errorMessage,
    );
  }

  @Get(':blogId/posts')
  async findPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() queryParams: QueryParams,
  ): Promise<PaginatorPostView> {
    const posts = await this.postsQueryRepository.findPostsByBlogId(
      blogId,
      queryParams,
      // req.userId,
    );
    if (!posts) throw new NotFoundException('Blog not found');

    return posts;
  }

  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() blogPostDto: CreateBlogPostDto,
  ): Promise<ViewPostDto> {
    const newPost = await this.blogsService.createPostByBlogId(
      blogId,
      blogPostDto,
    );
    if (!newPost) throw new NotFoundException('Blog not found');

    const result = await this.postsQueryRepository.getPostById(
      newPost._id,
      // req.userId,
    );

    return calcResultDto<ViewPostDto>(
      result.code,
      result.data as ViewPostDto,
      result.errorMessage,
    );
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<ViewBlogDto> {
    const result = await this.blogsQueryRepository.getBlogById(id);

    return calcResultDto<ViewBlogDto>(
      result.code,
      result.data as ViewBlogDto,
      result.errorMessage,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() blogDto: UpdateBlogDto) {
    const result = await this.blogsService.updateBlog(id, blogDto);
    return calcResultDto(result.code, result.data, result.errorMessage);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    const deletedBlog = await this.blogsService.deleteBlogById(id);
    if (!deletedBlog) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    }

    return;
  }
}
