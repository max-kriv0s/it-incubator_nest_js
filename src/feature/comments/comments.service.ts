import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ResultUpdateComment } from './dto/result-update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

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

  async deleteCommentByID(id: string): Promise<boolean> {
    const deletedComment = this.commentsRepository.deleteCommentByID(id);
    return deletedComment !== null;
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
}
