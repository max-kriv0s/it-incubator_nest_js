import { IsMongoId } from 'class-validator';

export class ParamCommentId {
  @IsMongoId()
  commentId: string;
}
