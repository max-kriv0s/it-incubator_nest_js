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
  UseGuards,
} from '@nestjs/common';
import { PostsQueryRepository } from './posts-query.repository';
import { PostsService } from './posts.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatorPostView, ViewPostDto } from './dto/view-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ParamIdDto, QueryParams } from '../../dto';
import {
  PaginatorCommentView,
  ViewCommentDto,
} from '../comments/dto/view-comment.dto';
import { CommentsQueryRepository } from '../comments/comments-query.repository';
import { AccessJwtAuthGuard } from '../auth/guard/jwt.guard';
import { BasicAuthGuard } from '../auth/guard/basic-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { ParamPostIdDto } from './dto/param-post-id.dto';

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

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() postDto: CreatePostDto): Promise<ViewPostDto> {
    const postId = await this.postsService.createPost(postDto);
    return this.postsQueryRepository.getPostById(postId);
  }

  @Get(':id')
  async getPostById(@Param() params: ParamIdDto): Promise<ViewPostDto> {
    return this.postsQueryRepository.getPostById(params.id);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param() params: ParamIdDto,
    @Body() postDto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(params.id, postDto);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param() params: ParamIdDto) {
    return this.postsService.deletePostById(params.id);
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get(':postId/comments')
  async findCommentsByPostId(
    @Param() params: ParamPostIdDto,
    @Query() queryParams: QueryParams,
    @CurrentUserId() userId: string,
  ): Promise<PaginatorCommentView> {
    const comments = await this.commentsQueryRepository.findCommentsByPostId(
      params.postId,
      queryParams,
      userId,
    );
    if (!comments) throw new NotFoundException('Post not found');

    return comments;
  }

  @UseGuards(AccessJwtAuthGuard)
  @Post(':postId/comments')
  async createCommentByPostID(
    @Param() params: ParamPostIdDto,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUserId() userId: string,
  ): Promise<ViewCommentDto> {
    const commentId = await this.postsService.createCommentByPostID(
      params.postId,
      userId,
      createCommentDto,
    );
    if (!commentId) throw new NotFoundException('Comment not fount');

    const comment = await this.commentsQueryRepository.getCommentViewById(
      commentId,
      userId,
    );
    if (!comment) throw new NotFoundException('Comment not fount');

    return comment;
  }
}
