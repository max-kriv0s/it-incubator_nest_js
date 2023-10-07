import { Injectable } from '@nestjs/common';
import { GameStatus, PairQuizGame } from './entities/pair-quiz-game.entity';
import {
  AnswerStatus,
  PairQuizGameProgress,
} from './entities/pair-quiz-game-progress.entity';
import { DataSource, EntityManager } from 'typeorm';
import { PairQuizGameProgressRepository } from './db/pair-quiz-game-progress.repository';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TransactionDecorator } from '../../decorators/transaction.decorator';
import { PairQuizGameRepository } from './db/pair-quiz-game.repository';
import { ResultNotification } from '../../modules/notification';

type PlayerInfo = {
  score: number;
  lastAnswerAddedAt: Date | null;
  idLastQuestion: number | null;
};

@Injectable()
export class PairQuizGameService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly pairQuizGameProgressRepository: PairQuizGameProgressRepository,
    private readonly pairQuizGameRepository: PairQuizGameRepository,
  ) {}

  async addBonusPoint(
    myCurrentGame: PairQuizGame,
    gameProgress: PairQuizGameProgress[],
    countAnswers: number,
    manager: EntityManager,
  ) {
    const firstPlayer: PlayerInfo = {
      score: 0,
      lastAnswerAddedAt: null,
      idLastQuestion: null,
    };

    const secondPlayer: PlayerInfo = {
      score: 0,
      lastAnswerAddedAt: null,
      idLastQuestion: null,
    };

    for (const question of gameProgress) {
      const playerInfo =
        question.userId === myCurrentGame.firstPlayerId
          ? firstPlayer
          : secondPlayer;

      playerInfo.score += question.score;

      if (question.questionNumber === countAnswers) {
        playerInfo.lastAnswerAddedAt = question.addedAt;
        playerInfo.idLastQuestion = question.id;
      }
    }

    const playerFinishedFirst =
      firstPlayer.lastAnswerAddedAt! < secondPlayer.lastAnswerAddedAt!
        ? firstPlayer
        : secondPlayer;

    if (playerFinishedFirst.score > 0) {
      const gameProgress = await this.pairQuizGameProgressRepository.findById(
        playerFinishedFirst.idLastQuestion!,
        manager,
      );
      if (gameProgress) {
        gameProgress.bonus_score += 1;
        await manager.save(gameProgress);
      }
    }
  }

  @Cron(CronExpression.EVERY_SECOND)
  async finishOpenGamesCron() {
    const transactionDecorator = new TransactionDecorator(this.dataSource);

    const openGames =
      await this.pairQuizGameProgressRepository.findOpenGamesToComplete();

    for (const game of openGames) {
      await transactionDecorator.doOperation(game, async (game, manager) => {
        const res = new ResultNotification();

        const openGame = await this.pairQuizGameRepository.findMyCurrentGame(
          game.userId,
          manager,
        );
        if (!openGame) {
          res.addError('Failed to complete the game', 5000);
          return res;
        }

        if (openGame.status !== GameStatus.Finished) {
          openGame.finishGame();
          await manager.save(openGame);

          const gameProgress =
            await this.pairQuizGameProgressRepository.findByGameId(game.id);

          for (const questionsAsked of gameProgress) {
            if (
              questionsAsked.userId !== game.userId &&
              !questionsAsked.answerStatus
            ) {
              questionsAsked.answerStatus = AnswerStatus.Incorrect;
              questionsAsked.addedAt = new Date();
              await manager.save(questionsAsked);
            }
          }

          const countAnswers = gameProgress.length / 2;

          await this.addBonusPoint(
            openGame,
            gameProgress,
            countAnswers,
            manager,
          );
        }

        return res;
      });
    }
  }
}
