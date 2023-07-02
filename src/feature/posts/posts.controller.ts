import {
  BadRequestException,
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
import { LikeInputDto } from '../likes/dto/like-input.dto';
import { GetFieldError } from '../../utils';

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
    @CurrentUserId(false) userId: string,
  ): Promise<PaginatorPostView> {
    return this.postsQueryRepository.getPosts(queryParams, userId);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(
    @Body() postDto: CreatePostDto,
    @CurrentUserId(false) userId: string,
  ): Promise<ViewPostDto> {
    const postId = await this.postsService.createPost(postDto);
    if (!postId)
      throw new BadRequestException([
        GetFieldError('Blog not found', 'blogId'),
      ]);
    return this.postsQueryRepository.getPostById(postId, userId);
  }

  @Get(':id')
  async getPostById(
    @Param() params: ParamIdDto,
    @CurrentUserId(false) userId: string,
  ): Promise<ViewPostDto> {
    return this.postsQueryRepository.getPostById(params.id, userId);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param() params: ParamIdDto,
    @Body() postDto: UpdatePostDto,
  ) {
    const result = await this.postsService.updatePost(params.id, postDto);

    if (!result.blogExists) {
      throw new BadRequestException([
        GetFieldError('Blog not found', 'blogId'),
      ]);
    }

    if (!result.postExists) throw new NotFoundException();
    return true;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param() params: ParamIdDto) {
    return this.postsService.deletePostById(params.id);
  }

  @Get(':postId/comments')
  async findCommentsByPostId(
    @Param() params: ParamPostIdDto,
    @Query() queryParams: QueryParams,
    @CurrentUserId(false) userId: string,
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

  @UseGuards(AccessJwtAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatusByPostId(
    @Param() params: ParamPostIdDto,
    @CurrentUserId() userId: string,
    @Body() dto: LikeInputDto,
  ) {
    const postСhanged = await this.postsService.likeStatusByPostID(
      params.postId,
      userId,
      dto.likeStatus,
    );
    if (!postСhanged) throw new NotFoundException('Post not found');
    return;
  }
}
