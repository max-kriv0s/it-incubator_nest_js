import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AccessJwtAuthGuard } from '../auth/guard/jwt.guard';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { LikeInputDto } from '../likes/dto/like-input.dto';
import { IdIntegerValidationPipe } from 'src/modules/pipes/id-integer-validation.pipe';
import { CommentsQuerySqlRepository } from './db/comments-query.sql-repository';
import { ResultNotification } from '../../modules/notification';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteCommentbyIdCommand } from './use-case/delete-comment-by-id.usecase';
import { UpdateCommentByIdCommand } from './use-case/update-comment-by-id.usecase';
import { SetLikeStatusByCommentIdCommand } from './use-case/set-like-status-by-comment-id.usecase';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQuerySqlRepository: CommentsQuerySqlRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':id')
  async findCommentByID(
    @Param('id', IdIntegerValidationPipe) id: string,
    @CurrentUserId(false) userId: string,
  ) {
    const comment = await this.commentsQuerySqlRepository.getCommentViewById(
      id,
      userId,
    );
    if (!comment) throw new NotFoundException();

    return comment;
  }

  @UseGuards(AccessJwtAuthGuard)
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCommentByID(
    @Param('commentId', IdIntegerValidationPipe) commentId: string,
    @CurrentUserId() userId: string,
  ) {
    const result: ResultNotification = await this.commandBus.execute(
      new DeleteCommentbyIdCommand(commentId, userId),
    );
    return result.getResult();
  }

  @UseGuards(AccessJwtAuthGuard)
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatedComment(
    @Param('commentId', IdIntegerValidationPipe) commentId: string,
    @Body() commentDto: UpdateCommentDto,
    @CurrentUserId() userId: string,
  ) {
    const result: ResultNotification = await this.commandBus.execute(
      new UpdateCommentByIdCommand(commentId, commentDto, userId),
    );
    return result.getResult();
  }

  @UseGuards(AccessJwtAuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatusByCommentID(
    @Param('commentId', IdIntegerValidationPipe) commentId: string,
    @Body() dto: LikeInputDto,
    @CurrentUserId() userId: string,
  ) {
    const commentСhanged = await this.commandBus.execute(
      new SetLikeStatusByCommentIdCommand(commentId, userId, dto.likeStatus),
    );

    if (!commentСhanged) throw new NotFoundException('Comment not found');
    return;
  }
}
