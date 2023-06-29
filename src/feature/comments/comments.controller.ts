import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ParamIdDto } from 'src/dto';
import { CommentsQueryRepository } from './comments-query.repository';
import { AccessJwtAuthGuard } from '../auth/guard/jwt.guard';
import { ParamCommentId } from './dto/param-comment-id.dto';
import { CommentsService } from './comments.service';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  async findCommentByID(
    @Param() params: ParamIdDto,
    // @CurrentUserId() userId: string,
  ) {
    const comment = await this.commentsQueryRepository.getCommentViewById(
      params.id,
      //   userId,
    );
    if (!comment) throw new NotFoundException();

    return comment;
  }

  @UseGuards(AccessJwtAuthGuard)
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCommentByID(@Param() params: ParamCommentId) {
    const isDeleted = await this.commentsService.deleteCommentByID(
      params.commentId,
    );
    if (!isDeleted) throw new NotFoundException();

    return;
  }

  @UseGuards(AccessJwtAuthGuard)
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatedComment(
    @Param() params: ParamCommentId,
    @Body() commentDto: UpdateCommentDto,
    @CurrentUserId() userId: string,
  ) {
    const result = await this.commentsService.updatedComment(
      params.commentId,
      commentDto,
      userId,
    );
    if (!result.commentExists) throw new NotFoundException();
    if (!result.isUserComment) throw new ForbiddenException();

    return;
  }
}
