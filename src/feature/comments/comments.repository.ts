import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument, CommentModelType } from './comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async deleteComments() {
    await this.CommentModel.deleteMany({});
  }

  async save(comment: CommentDocument): Promise<CommentDocument> {
    return comment.save();
  }

  createCommentByPostId(
    postId: string,
    userId: string,
    userLogin: string,
    createCommentDto: CreateCommentDto,
  ): CommentDocument {
    return this.CommentModel.createComment(
      postId,
      userId,
      userLogin,
      createCommentDto,
      this.CommentModel,
    );
  }

  async deleteCommentByID(id: string): Promise<CommentDocument | null> {
    return this.CommentModel.findByIdAndDelete({ _id: id });
  }

  async findCommentByID(id: string): Promise<CommentDocument | null> {
    return this.CommentModel.findById(id);
  }
}
