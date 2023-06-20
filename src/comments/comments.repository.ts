import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from './comment.schema';

@Injectable()
export class CommetsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async deleteComments() {
    await this.CommentModel.deleteMany({});
  }
}
