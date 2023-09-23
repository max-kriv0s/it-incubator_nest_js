import { Paginator, PaginatorType } from '../../../dto';

export class PairQuizGameStatisticViewDto {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
}

export class PairQuizGameUsersTopView extends PairQuizGameStatisticViewDto {
  player: {
    id: string;
    login: string;
  };
}

export type PaginatorPairQuizGameUsersTopViewType =
  PaginatorType<PairQuizGameUsersTopView>;
export class PaginatorPairQuizGameUsersTop extends Paginator<PairQuizGameUsersTopView> {
  constructor(page: number, pageSize: number) {
    super(page, pageSize);
  }
}
