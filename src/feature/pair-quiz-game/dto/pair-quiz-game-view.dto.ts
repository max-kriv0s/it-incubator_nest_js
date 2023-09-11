import { Question } from '../../../feature/questions/entities/question.entity';
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
  questions: Pick<Question, 'id' | 'body'>[] | null;
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
}
