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
import { calcResultDto } from '../utils';
import { PaginatorPostView, ViewPostDto } from './dto/view-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryParams, ResultCode } from '../dto';
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
  async createPost(
    @Body() postDto: CreatePostDto,
  ): Promise<ViewPostDto | null> {
    const resultCreatedPost = await this.postsService.createPost(postDto);
    if (resultCreatedPost.code !== ResultCode.Success) {
      return calcResultDto<null>(
        resultCreatedPost.code,
        null,
        resultCreatedPost.errorMessage,
      );
    }

    const createdPost = resultCreatedPost.data;
    if (!createdPost) {
      throw new HttpException(
        'Post not created',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const result = await this.postsQueryRepository.getPostById(createdPost._id);

    return calcResultDto<ViewPostDto>(
      result.code,
      result.data as ViewPostDto,
      result.errorMessage,
    );
  }

  @Get(':id')
  async getPostById(@Param('id') id: string): Promise<ViewPostDto> {
    const result = await this.postsQueryRepository.getPostById(id);

    return calcResultDto<ViewPostDto>(
      result.code,
      result.data as ViewPostDto,
      result.errorMessage,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() postDto: UpdatePostDto) {
    const result = await this.postsService.updatePost(id, postDto);
    return calcResultDto(result.code, result.data, result.errorMessage);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    const deletedPost = await this.postsService.deletePostById(id);
    if (!deletedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    return;
  }

  @Get(':postId/comments')
  async findCommentsByPostId(
    @Param('postId') postId: string,
    @Query() queryParams: QueryParams,
  ): Promise<PaginatorCommentView> {
    const post = await this.postsService.findPostById(postId);
    if (!post) throw new NotFoundException('Post not found');

    // const userId = req.userId;

    const comments = await this.commentsQueryRepository.findCommentsByPostId(
      postId,
      queryParams,
      // userId,
    );
    if (!comments) throw new NotFoundException('Post not found');

    return comments;
  }
}
