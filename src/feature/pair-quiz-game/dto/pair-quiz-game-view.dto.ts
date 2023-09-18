import { Paginator, PaginatorType } from '../../../dto';
import { AnswerStatus } from '../entities/pair-quiz-game-progress.entity';
import { GameStatus } from '../entities/pair-quiz-game.entity';

export class Answer {
  questionId: string;
  answerStatus: AnswerStatus | null;
  addedAt: string | null;
}

export class PlayerProgress {
  answers: Answer[];
  player: {
    id: string;
    login: string;
  };
  score: number;
}

export class PairQuizGameViewDto {
  id: string;
  firstPlayerProgress: PlayerProgress;
  secondPlayerProgress: PlayerProgress | null;
  questions: { id: string; body: string }[] | null;
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
}

export type PaginatorPairQuizGameViewType = PaginatorType<PairQuizGameViewDto>;
export class PaginatorPairQuizGame extends Paginator<PairQuizGameViewDto> {
  constructor(page: number, pageSize: number) {
    super(page, pageSize);
  }
}
