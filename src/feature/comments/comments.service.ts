import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './db/comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { LikeStatus } from '../likes/dto/like-status';
import { LikeCommentsService } from './like-comments.service';

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

  async likeStatusByCommentID(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    const commentExists = await this.commentsRepository.commentExists(
      commentId,
    );
    if (!commentExists) return false;
    // const comment = await this.commentsRepository.findCommentByID(commentId);
    // if (!comment) return false;

    const countLikeDislyke = await this.likeCommentsService.ChangeLike(
      commentId,
      userId,
      likeStatus,
    );
    // comment.updateCountLikeDislike(countLikeDislyke);
    // await this.commentsRepository.save(comment);

    const isUpdated = await this.commentsRepository.updateCountLikeDislike(
      commentId,
      countLikeDislyke,
    );
    if (!isUpdated) return false;
    return true;
  }
}
