import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class CommentatorInfo {
  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userLogin: string;
}

@Schema()
export class Comment {
  _id: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop()
  commentatorInfo: CommentatorInfo;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  postId: Types.ObjectId;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  dislikesCount: number;

  static createComment(
    postId: string,
    userId: string,
    userLogin: string,
    createCommentDto: CreateCommentDto,
    CommentModel: CommentModelType,
  ): CommentDocument {
    const data = {
      content: createCommentDto.content,
      commentatorInfo: {
        userId: new Types.ObjectId(userId),
        userLogin: userLogin,
      },
      createdAt: new Date().toISOString(),
      postId: new Types.ObjectId(postId),
      likesCount: 0,
      dislikesCount: 0,
    };
    return new CommentModel(data);
  }

  updateComment(commentDto: UpdateCommentDto) {
    this.content = commentDto.content;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
  updateComment: Comment.prototype.updateComment,
};

export type CommentModelStaticType = {
  createComment: (
    postId: string,
    userId: string,
    userLogin: string,
    createCommentDto: CreateCommentDto,
    CommentModel: CommentModelType,
  ) => CommentDocument;
};

const commentStaticMethods: CommentModelStaticType = {
  createComment: Comment.createComment,
};
CommentSchema.statics = commentStaticMethods;

export type CommentModelType = Model<Comment> & CommentModelStaticType;
