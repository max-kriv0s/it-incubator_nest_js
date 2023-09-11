import { AnswerStatus } from '../entities/pair-quiz-game-progress.entity';

export class PairQuizGameProgressViewDto {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
}
