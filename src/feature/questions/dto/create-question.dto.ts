import { IsArray, IsString, Length } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @Length(10, 500)
  readonly body: string;

  @IsArray()
  @IsString({ each: true })
  readonly correctAnswers: string[];
}
