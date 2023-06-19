import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BlogsQueryRepository } from './blogs.query.repository';
import { QueryParams } from 'src/dto';
import { PaginatorBlogView, ViewBlogDto } from './dto/view-blog.dto';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsService: BlogsService,
  ) {}

  @Get()
  async getBlogs(
    @Query() queryParams: QueryParams,
  ): Promise<PaginatorBlogView> {
    return await this.blogsQueryRepository.getBlogs(queryParams);
  }

  @Post()
  async createBlog(@Body() blogDto: CreateBlogDto): Promise<ViewBlogDto> {
    const createdBlog = await this.blogsService.createBlog(blogDto);

    const blogView = await this.blogsQueryRepository.getBlogById(
      createdBlog._id,
    );

    return blogView;
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<ViewBlogDto> {
    return this.blogsQueryRepository.getBlogById(id);
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
