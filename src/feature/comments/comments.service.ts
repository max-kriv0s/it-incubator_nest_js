import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ResultUpdateComment } from './dto/result-update-comment.dto';
import { LikeStatus } from '../likes/dto/like-status';
import { LikeCommentsService } from './like-comments.service';
import { ResultDeleteComment } from './dto/result-delete-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly likeCommentsService: LikeCommentsService,
  ) {}

  async createCommentByPostId(
    postId: string,
    userId: string,
    userLogin: string,
    createCommentDto: CreateCommentDto,
  ): Promise<string> {
    const newComment = this.commentsRepository.createCommentByPostId(
      postId,
      userId,
      userLogin,
      createCommentDto,
    );
    await this.commentsRepository.save(newComment);
    return newComment._id.toString();
  }

  async deleteCommentByID(
    id: string,
    userId: string,
  ): Promise<ResultDeleteComment> {
    const result: ResultUpdateComment = {
      commentExists: false,
      isUserComment: false,
    };

    const comment = await this.commentsRepository.findCommentByID(id);
    if (!comment) return result;
    result.commentExists = true;

    if (comment.commentatorInfo.userId.toString() !== userId) return result;
    result.isUserComment = true;

    await this.commentsRepository.deleteCommentByID(id);
    return result;
  }

  async updatedComment(
    id: string,
    commentDto: UpdateCommentDto,
    userId: string,
  ): Promise<ResultUpdateComment> {
    const result: ResultUpdateComment = {
      commentExists: false,
      isUserComment: false,
    };

    const comment = await this.commentsRepository.findCommentByID(id);
    if (!comment) return result;
    result.commentExists = true;

    if (comment.commentatorInfo.userId.toString() !== userId) return result;
    result.isUserComment = true;

    comment.updateComment(commentDto);
    await this.commentsRepository.save(comment);
    return result;
  }

  async likeStatusByCommentID(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    const comment = await this.commentsRepository.findCommentByID(commentId);
    if (!comment) return false;

    const countLikeDislyke = await this.likeCommentsService.ChangeLike(
      commentId,
      userId,
      likeStatus,
    );
    comment.updateCountLikeDislike(countLikeDislyke);

    await this.commentsRepository.save(comment);
    return true;
  }
}
