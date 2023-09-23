import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { GameStatus, PairQuizGame } from '../entities/pair-quiz-game.entity';
import {
  Answer,
  PaginatorPairQuizGameViewType,
  PairQuizGameViewDto,
  PlayerProgress,
} from '../dto/pair-quiz-game-view.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { PairQuizGameQueryParams } from '../dto/pair-quiz-game-query-params.dto';
import { IPaginator } from '../../../dto';
import { User } from '../../../feature/users/entities/user.entity';
import { PairQuizGameProgress } from '../entities/pair-quiz-game-progress.entity';

@Injectable()
export class PairQuizGameQueryRepository {
  constructor(
    @InjectRepository(PairQuizGame)
    private readonly pairQuizGameRepository: Repository<PairQuizGame>,
  ) {}

  async findGameById(
    id: number,
    userId: number,
  ): Promise<ResultNotification<PairQuizGameViewDto>> {
    const result = new ResultNotification<PairQuizGameViewDto>();

    const infoGame = await this.pairQuizGameRepository.findOne({
      where: { id },
      relations: {
        firstPlayer: true,
        secondPlayer: true,
        gameProgress: {
          question: true,
        },
      },
      order: {
        gameProgress: {
          questionNumber: 'ASC',
        },
      },
    });
    if (!infoGame) {
      result.addError('Game not found', ResultCodeError.NotFound);
    }
    if (
      infoGame &&
      infoGame.firstPlayerId !== userId &&
      infoGame.secondPlayerId !== userId
    ) {
      result.addError('Access denied', ResultCodeError.Forbidden);
    }

    if (infoGame) {
      const infoGameView = this.convertToView(infoGame);
      result.addData(infoGameView);
    }
    return result;
  }

  async myCurrentGame(userId: number): Promise<PairQuizGameViewDto | null> {
    const infoGame = await this.pairQuizGameRepository.findOne({
      where: [
        { firstPlayerId: userId, status: Not(GameStatus.Finished) },
        { secondPlayerId: userId, status: Not(GameStatus.Finished) },
      ],
      relations: {
        firstPlayer: true,
        secondPlayer: true,
        gameProgress: {
          question: true,
        },
      },
      order: {
        gameProgress: {
          questionNumber: 'ASC',
        },
      },
    });
    if (!infoGame) return null;
    return this.convertToView(infoGame);
  }

  async getAllMyGames(
    queryParams: PairQuizGameQueryParams,
    userId: number,
    paginator: IPaginator<PairQuizGameViewDto>,
  ): Promise<PaginatorPairQuizGameViewType> {
    const sortBy: string = queryParams.sortBy ?? 'pairCreatedDate';
    const sortDirection: string = queryParams.sortDirection ?? 'desc';

    // const orderBy = {};
    // if (sortBy && sortBy !== 'pairCreatedDate') {
    //   orderBy[sortBy] = sortDirection;
    // }

    // if (sortBy === 'pairCreatedDate') {
    //   orderBy['pairCreatedDate'] = sortDirection;
    // } else {
    //   orderBy['pairCreatedDate'] = 'desc';
    // }

    // orderBy['gameProgress'] = { questionNumber: 'ASC' };

    // const [infoGames, totalCount] =
    //   await this.pairQuizGameRepository.findAndCount({
    //     where: [{ firstPlayerId: userId }, { secondPlayerId: userId }],
    //     relations: {
    //       firstPlayer: true,
    //       secondPlayer: true,
    //       gameProgress: {
    //         question: true,
    //       },
    //     },
    //     order: orderBy,
    //     take: paginator.pageSize,
    //     skip: paginator.skip,
    //   });

    const gamesQuery = this.pairQuizGameRepository
      .createQueryBuilder('game')
      .select('game.id')
      .where(
        'game."firstPlayerId" = :userId OR game."secondPlayerId" = :userId',
        { userId },
      )
      .limit(paginator.pageSize)
      .offset(paginator.skip);

    this.addSortingToQueryAllMyGames(gamesQuery, sortBy, sortDirection);
    // if (sortBy !== 'pairCreatedDate') {
    //   gamesQuery.addOrderBy(
    //     `game."${sortBy}"`,
    //     sortDirection === 'desc' ? 'DESC' : 'ASC',
    //   );
    // }

    // if (sortBy === 'pairCreatedDate') {
    //   gamesQuery.addOrderBy(
    //     `game."pairCreatedDate"`,
    //     sortDirection === 'desc' ? 'DESC' : 'ASC',
    //   );
    // } else {
    //   gamesQuery.addOrderBy(`game."pairCreatedDate"`, 'DESC');
    // }

    const [games, totalCount] = await gamesQuery.getManyAndCount();

    const query = this.pairQuizGameRepository
      .createQueryBuilder('game')
      .addSelect(['firstPlayer.id', 'firstPlayer.login'])
      .addSelect(['secondPlayer.id', 'secondPlayer.login'])
      .leftJoin('game.firstPlayer', 'firstPlayer')
      .leftJoin('game.secondPlayer', 'secondPlayer')
      .leftJoinAndSelect('game.gameProgress', 'gameProgress')
      .leftJoinAndSelect('gameProgress.question', 'question')
      // .where(
      //   'game."firstPlayerId" = :userId OR game."secondPlayerId" = :userId',
      //   { userId },
      // )
      .where('game.id IN (:...ids)', { ids: games.map((game) => game.id) })
      .addOrderBy(`"gameProgress"."questionNumber"`, 'ASC');

    this.addSortingToQueryAllMyGames(query, sortBy, sortDirection);

    const infoGames = await query.getMany();
    const gamesView = infoGames.map((game) => this.convertToView(game));
    return paginator.paginate(totalCount, gamesView);
  }

  addSortingToQueryAllMyGames(
    query: SelectQueryBuilder<PairQuizGame>,
    sortBy: string,
    sortDirection: string,
  ) {
    if (sortBy !== 'pairCreatedDate') {
      query.addOrderBy(
        `game."${sortBy}"`,
        sortDirection === 'desc' ? 'DESC' : 'ASC',
      );
    }

    if (sortBy === 'pairCreatedDate') {
      query.addOrderBy(
        `game."pairCreatedDate"`,
        sortDirection === 'desc' ? 'DESC' : 'ASC',
      );
    } else {
      query.addOrderBy(`game."pairCreatedDate"`, 'DESC');
    }
  }

  convertToView(infoGame: PairQuizGame): PairQuizGameViewDto {
    const question: { id: string; body: string }[] = [];

    const firstPlayerAnswers: Answer[] = [];
    let firstPlayerScore = 0;

    const secondPlayerAnswers: Answer[] = [];
    let secondPlayerScore = 0;

    for (const userProgress of infoGame.gameProgress) {
      const answer: Answer = {
        questionId: userProgress.questionId.toString(),
        answerStatus: userProgress.answerStatus,
        addedAt: userProgress.addedAt
          ? userProgress.addedAt.toISOString()
          : null,
      };
      if (userProgress.userId === infoGame.firstPlayerId) {
        if (answer.answerStatus) firstPlayerAnswers.push(answer);
        question.push({
          id: userProgress.question.id.toString(),
          body: userProgress.question.body,
        });
        firstPlayerScore += userProgress.score + userProgress.bonus_score;
      }
      if (userProgress.userId === infoGame.secondPlayerId) {
        if (answer.answerStatus) secondPlayerAnswers.push(answer);
        secondPlayerScore += userProgress.score + userProgress.bonus_score;
      }
    }

    const firstPlayerProgress: PlayerProgress = {
      answers: firstPlayerAnswers,
      player: {
        id: infoGame.firstPlayer.id.toString(),
        login: infoGame.firstPlayer.login,
      },
      score: firstPlayerScore,
    };

    let secondPlayerProgress: PlayerProgress | null = null;
    if (infoGame.secondPlayerId) {
      secondPlayerProgress = {
        answers: secondPlayerAnswers,
        player: {
          id: infoGame.secondPlayer.id.toString(),
          login: infoGame.secondPlayer.login,
        },
        score: secondPlayerScore,
      };
    }

    return {
      id: infoGame.id.toString(),
      firstPlayerProgress: firstPlayerProgress,
      secondPlayerProgress: secondPlayerProgress,
      questions: question.length ? question : null,
      status: infoGame.status,
      pairCreatedDate: infoGame.pairCreatedDate.toISOString(),
      startGameDate: infoGame.startGameDate
        ? infoGame.startGameDate.toISOString()
        : null,
      finishGameDate: infoGame.finishGameDate
        ? infoGame.finishGameDate.toISOString()
        : null,
    };
  }
}
