import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PairQuizGameProgress } from '../entities/pair-quiz-game-progress.entity';
import { PairQuizGameProgressViewDto } from '../dto/pair-quiz-game-progress-view.dto';
import { PairQuizGameStatisticViewDto } from '../dto/pair-quiz-game-statistic-view.dto';

@Injectable()
export class PairQuizGameProgressQueryRepository {
  constructor(
    @InjectRepository(PairQuizGameProgress)
    private readonly pairQuizGameProgressRepository: Repository<PairQuizGameProgress>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async findQuestionById(
    id: number,
  ): Promise<PairQuizGameProgressViewDto | null> {
    const question = await this.pairQuizGameProgressRepository.findOneBy({
      id,
    });
    if (!question) return null;
    return {
      questionId: question.questionId.toString(),
      answerStatus: question.answerStatus,
      addedAt: question.addedAt!.toISOString(),
    };
  }

  async userGameStatistics(
    userId: number,
  ): Promise<PairQuizGameStatisticViewDto> {
    const userGamesRaw = await this.dataSource
      .createQueryBuilder()
      .addCommonTableExpression(
        `SELECT 
          "gameId", 
          SUM(score + bonus_score) as score
        FROM public."PairQuizGameProgress"
        WHERE "userId" = :user_id
        GROUP BY "gameId", "userId"
      `,
        'user_games',
      )
      .addCommonTableExpression(
        `SELECT 
          "gameId", 
          SUM(score + bonus_score) as score
        FROM public."PairQuizGameProgress"
        WHERE "gameId" IN (SELECT "gameId" FROM user_games) AND "userId" != :user_id
        GROUP BY "gameId", "userId"`,
        'second_user_score',
      )
      .select(
        `ug."gameId" as "gameId",
        ug."score"::int as "score",
        u2."score"::int as "u2_score"
      `,
      )
      .from(`user_games`, 'ug')
      .leftJoin('second_user_score', 'u2', 'ug."gameId" = u2."gameId"')
      .setParameter('user_id', userId)
      .getRawMany();

    const gameStatisticView: PairQuizGameStatisticViewDto = {
      sumScore: 0,
      avgScores: 0,
      gamesCount: 0,
      winsCount: 0,
      lossesCount: 0,
      drawsCount: 0,
    };

    const gamesCount = userGamesRaw.length;
    if (gamesCount === 0) return gameStatisticView;

    for (const game of userGamesRaw) {
      gameStatisticView.sumScore += game.score;
      gameStatisticView.winsCount += game.score > game.u2_score ? 1 : 0;
      gameStatisticView.lossesCount += game.score < game.u2_score ? 1 : 0;
      gameStatisticView.drawsCount += game.score === game.u2_score ? 1 : 0;
    }

    gameStatisticView.gamesCount = gamesCount;

    let avgScore =
      Math.round(
        (gameStatisticView.sumScore / gameStatisticView.gamesCount) * 100,
      ) / 100;
    if (avgScore === Math.round(avgScore)) {
      avgScore = Math.round(avgScore);
    }
    gameStatisticView.avgScores = avgScore;

    return gameStatisticView;
  }
}
