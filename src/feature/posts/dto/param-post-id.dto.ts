import { IsMongoId } from 'class-validator';

export class ParamPostIdDto {
  @IsMongoId()
  postId: string;
}
