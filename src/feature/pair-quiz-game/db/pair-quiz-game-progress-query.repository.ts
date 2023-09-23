import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PairQuizGameProgress } from '../entities/pair-quiz-game-progress.entity';
import { PairQuizGameProgressViewDto } from '../dto/pair-quiz-game-progress-view.dto';
import {
  PaginatorPairQuizGameUsersTopViewType,
  PairQuizGameStatisticViewDto,
  PairQuizGameUsersTopView,
} from '../dto/pair-quiz-game-statistic-view.dto';
import { IPaginator } from '../../../dto';
import { PairQuizGameUsersTopQueryParams } from '../dto/pair-quiz-game-query-params.dto';
import { User } from '../../../feature/users/entities/user.entity';

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

  async getUsersTop(
    queryParams: PairQuizGameUsersTopQueryParams,
    paginator: IPaginator<PairQuizGameUsersTopView>,
  ): Promise<PaginatorPairQuizGameUsersTopViewType> {
    const sort: string | string[] = queryParams.sort ?? [
      'avgScores desc',
      'sumScore desc',
    ];

    const playersCount = await this.pairQuizGameProgressRepository
      .createQueryBuilder('p')
      .select('p."userId"')
      .distinct(true)
      .getRawMany();

    const totalCount = playersCount.length;

    const query = this.dataSource
      .createQueryBuilder()
      .addCommonTableExpression(
        `SELECT 
        "gameId", 
        "userId",
        SUM(score + bonus_score) as score
      FROM public."PairQuizGameProgress"
      WHERE "userId" IN (:...playersIds)
      GROUP BY "gameId", "userId"
    `,
        'user_games',
      )
      .addCommonTableExpression(
        `SELECT 
        "gameId", 
        "userId",
        SUM(score + bonus_score) as score
      FROM public."PairQuizGameProgress"
      WHERE "gameId" IN (SELECT "gameId" FROM user_games)
      GROUP BY "gameId", "userId"`,
        'second_user_score',
      )
      .select(
        `ug."userId" as "userId",
        COUNT(ug."gameId")::int as "gamesCount",
        user.login as login,
        SUM(ug."score")::int as "sumScore",
        SUM(
          CASE
            WHEN ug."score" > u2."score"
              THEN 1
            ELSE 0
          END
        )::int as "winsCount",
        SUM(
          CASE
            WHEN ug."score" < u2."score"
              THEN 1
            ELSE 0
          END
        )::int as "lossesCount",
        SUM(
          CASE
            WHEN ug."score" = u2."score"
              THEN 1
            ELSE 0
          END
        )::int as "drawsCount",
          ROUND(SUM(ug."score") / COUNT(ug."gameId"), 2)::int as "avgScores"
        `,
      )
      .from(`user_games`, 'ug')
      .leftJoin(
        'second_user_score',
        'u2',
        'ug."gameId" = u2."gameId" AND ug."userId" != u2."userId"',
      )
      .leftJoin(User, 'user', 'ug."userId" = user.id')
      .groupBy('ug."userId", user.login')
      .limit(paginator.pageSize)
      .offset(paginator.skip)
      .setParameter(
        'playersIds',
        playersCount.map((player) => player.userId),
      );

    for (const el of sort) {
      const [nameField, sortDirection] = el.split(' ');
      query.addOrderBy(
        `"${nameField}"`,
        sortDirection === 'asc' ? 'ASC' : 'DESC',
      );
    }

    const playerGameStatisticsRaw = await query.getRawMany();

    const playersTopView: PairQuizGameUsersTopView[] =
      playerGameStatisticsRaw.map((player) => {
        return {
          gamesCount: player.gamesCount,
          winsCount: player.winsCount,
          lossesCount: player.lossesCount,
          drawsCount: player.drawsCount,
          sumScore: player.sumScore,
          avgScores: player.avgScores,
          player: {
            id: player.userId.toString(),
            login: player.login,
          },
        };
      });

    return paginator.paginate(totalCount, playersTopView);
  }
}
