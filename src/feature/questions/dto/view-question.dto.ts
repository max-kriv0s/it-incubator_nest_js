import { Paginator, PaginatorType } from '../../../dto';

export class QuestionViewDto {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PaginatorQuestionViewType = PaginatorType<QuestionViewDto>;

export class PaginatorQuestionView extends Paginator<QuestionViewDto> {
  constructor(page: number, pageSize: number) {
    super(page, pageSize);
  }
}
