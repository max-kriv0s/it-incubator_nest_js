import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
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
    try {
      return this.blogsQueryRepository.getBlogs(queryParams);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async createBlog(@Body() blogDto: CreateBlogDto): Promise<ViewBlogDto> {
    try {
      const createdBlog = await this.blogsService.createBlog(blogDto);

      const result = await this.blogsQueryRepository.getBlogById(
        createdBlog._id,
      );

      return calcResultDto<ViewBlogDto>(
        result.code,
        result.data as ViewBlogDto,
        result.errorMessage,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string): Promise<ViewBlogDto> {
    try {
      const result = await this.blogsQueryRepository.getBlogById(id);

      return calcResultDto<ViewBlogDto>(
        result.code,
        result.data as ViewBlogDto,
        result.errorMessage,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() blogDto: UpdateBlogDto) {
    try {
      const result = await this.blogsService.updateBlog(id, blogDto);
      return calcResultDto(result.code, result.data, result.errorMessage);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    try {
      const deletedBlog = this.blogsService.deleteBlogById(id);
      if (!deletedBlog) {
        throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
      }

      return;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
