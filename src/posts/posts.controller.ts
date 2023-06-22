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
import { PostsQueryRepository } from './posts-query.repository';
import { PostsService } from './posts.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatorPostView, ViewPostDto } from './dto/view-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryParams } from '../dto';
import { PaginatorCommentView } from '../comments/dto/view-comment.dto';
import { CommentsQueryRepository } from '../comments/comments-query.repository';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  async getPosts(
    @Query() queryParams: QueryParams,
  ): Promise<PaginatorPostView> {
    return this.postsQueryRepository.getPosts(queryParams);
  }

  @Post()
  async createPost(@Body() postDto: CreatePostDto): Promise<ViewPostDto> {
    const postId = await this.postsService.createPost(postDto);
    return this.postsQueryRepository.getPostById(postId);
  }

  @Get(':id')
  async getPostById(@Param('id') id: string): Promise<ViewPostDto> {
    return this.postsQueryRepository.getPostById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() postDto: UpdatePostDto) {
    return this.postsService.updatePost(id, postDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    return this.postsService.deletePostById(id);
  }

  @Get(':postId/comments')
  async findCommentsByPostId(
    @Param('postId') postId: string,
    @Query() queryParams: QueryParams,
  ): Promise<PaginatorCommentView> {
    // const userId = req.userId;

    return this.commentsQueryRepository.findCommentsByPostId(
      postId,
      queryParams,
      // userId,
    );
  }
}
