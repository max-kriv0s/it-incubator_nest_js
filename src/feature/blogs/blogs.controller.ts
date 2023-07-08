import {
  Body,
  Controller,
  Get,
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

  @Get(':id')
  async getBlogById(
    @Param('id', IdValidationPipe) id: string,
  ): Promise<ViewBlogDto> {
    const blogView = await this.blogsQueryRepository.getBlogById(id);
    if (!blogView) throw new NotFoundException('Blog not found');
    return blogView;
  }
}
