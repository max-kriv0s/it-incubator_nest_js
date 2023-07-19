import {
  Body,
  Controller,
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
import { PaginatorPostView, ViewPostDto } from './dto/view-post.dto';
import { QueryParams } from '../../dto';
import {
  PaginatorCommentView,
  ViewCommentDto,
} from '../comments/dto/view-comment.dto';
import { CommentsQueryRepository } from '../comments/comments-query.repository';
import { AccessJwtAuthGuard } from '../auth/guard/jwt.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { ParamPostIdDto } from './dto/param-post-id.dto';
import { LikeInputDto } from '../likes/dto/like-input.dto';
import { IdValidationPipe } from '../../modules/pipes/id-validation.pipe';

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

  // @UseGuards(BasicAuthGuard)
  // @Post()
  // async createPost(
  //   @Body() postDto: CreatePostDto,
  //   @CurrentUserId(false) userId: string,
  // ): Promise<ViewPostDto> {
  //   const postId = await this.postsService.createPost(postDto);
  //   if (!postId)
  //     throw new BadRequestException([
  //       GetFieldError('Blog not found', 'blogId'),
  //     ]);
  //   const postView = await this.postsQueryRepository.getPostById(
  //     postId,
  //     userId,
  //   );

  //   if (!postView) throw new NotFoundException('Post not found');
  //   return postView;
  // }

  @Get(':id')
  async getPostById(
    @Param('id', IdValidationPipe) id: string,
    @CurrentUserId(false) userId: string,
  ): Promise<ViewPostDto> {
    const postView = await this.postsQueryRepository.getPostById(id, userId);
    if (!postView) throw new NotFoundException('Post not found');
    return postView;
  }

  // @UseGuards(BasicAuthGuard)
  // @Put(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async updatePost(
  //   @Param('id', IdValidationPipe) id: string,
  //   @Body() postDto: UpdatePostDto,
  // ) {
  //   const result = await this.postsService.updatePost(id, postDto);
  //   return replyByNotification(result);
  // }

  // @UseGuards(BasicAuthGuard)
  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteBlog(@Param('id', IdValidationPipe) id: string) {
  //   const isDeleted = await this.postsService.deletePostById(id);
  //   if (!isDeleted) throw new NotFoundException('Post not found');
  //   return;
  // }

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
    if (!commentId) throw new NotFoundException('Post not fount');

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
