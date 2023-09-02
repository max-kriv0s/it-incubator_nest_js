import { IsBoolean } from 'class-validator';

export class QuestionPublishDto {
  @IsBoolean()
  published: boolean;
}
