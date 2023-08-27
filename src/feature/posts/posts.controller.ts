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
import {
  PaginatorPostSql,
  PaginatorPostSqlType,
  ViewPostDto,
} from './dto/view-post.dto';
import { QueryParams } from '../../dto';
import {
  PaginatorCommentSql,
  PaginatorCommentView,
  ViewCommentDto,
} from '../comments/dto/view-comment.dto';
import { AccessJwtAuthGuard } from '../auth/guard/jwt.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { LikeInputDto } from '../likes/dto/like-input.dto';
import { ResultNotification } from '../../modules/notification';
import { IdIntegerValidationPipe } from '../../modules/pipes/id-integer-validation.pipe';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentByPostIdCommand } from './use-case/create-comment-by-post-id.usecase';
import { LikeStatusByPostIdCommand } from './use-case/like-status-by-post-id.usecase';
import { PostsQueryRepository } from './db/posts-query.repository';
import { CommentsQueryRepository } from '../comments/db/comments-query.repository';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getPosts(
    @Query() queryParams: QueryParams,
    @CurrentUserId(false) userId: string,
  ): Promise<PaginatorPostSqlType> {
    const paginator = new PaginatorPostSql(
      +queryParams.pageNumber,
      +queryParams.pageSize,
    );
    return this.postsQueryRepository.getPosts(queryParams, paginator, +userId);
  }

  @Get(':id')
  async getPostById(
    @Param('id', IdIntegerValidationPipe) id: string,
    @CurrentUserId(false) userId: string,
  ): Promise<ViewPostDto> {
    const postView = await this.postsQueryRepository.getPostById(+id, +userId);
    if (!postView) throw new NotFoundException('Post not found');
    return postView;
  }

  @Get(':postId/comments')
  async findCommentsByPostId(
    @Param('postId', IdIntegerValidationPipe) postId: string,
    @Query() queryParams: QueryParams,
    @CurrentUserId(false) userId: string,
  ): Promise<PaginatorCommentView> {
    const paginator = new PaginatorCommentSql(
      +queryParams.pageNumber,
      +queryParams.pageSize,
    );

    const comments = await this.commentsQueryRepository.findCommentsByPostId(
      +postId,
      queryParams,
      paginator,
      +userId,
    );
    if (!comments) throw new NotFoundException('Post not found');

    return comments;
  }

  @UseGuards(AccessJwtAuthGuard)
  @Post(':postId/comments')
  async createCommentByPostID(
    @Param('postId', IdIntegerValidationPipe) postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUserId() userId: string,
  ): Promise<ViewCommentDto> {
    const result: ResultNotification<number> = await this.commandBus.execute(
      new CreateCommentByPostIdCommand(+postId, +userId, createCommentDto),
    );
    const commentId = result.getResult();

    const comment = await this.commentsQueryRepository.getCommentViewById(
      commentId!,
      +userId,
    );
    if (!comment) throw new NotFoundException('Comment not fount');
    return comment;
  }

  @UseGuards(AccessJwtAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatusByPostId(
    @Param('postId', IdIntegerValidationPipe) postId: string,
    @CurrentUserId() userId: string,
    @Body() dto: LikeInputDto,
  ) {
    const isDone = await this.commandBus.execute(
      new LikeStatusByPostIdCommand(+postId, +userId, dto.likeStatus),
    );
    if (!isDone) throw new NotFoundException('Post not found');
  }
}
