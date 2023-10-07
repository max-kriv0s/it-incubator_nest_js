import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PairQuizGameRepository } from '../db/pair-quiz-game.repository';
import {
  AnswerStatus,
  PairQuizGameProgress,
} from '../entities/pair-quiz-game-progress.entity';
import { PairQuizGameProgressRepository } from '../db/pair-quiz-game-progress.repository';
import { GameStatus, PairQuizGame } from '../entities/pair-quiz-game.entity';
import { DataSource, EntityManager } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';

type PlayerInfo = {
  score: number;
  lastAnswerAddedAt: Date | null;
  idLastQuestion: number | null;
};

export class AnswerPairQuizGameCommand {
  constructor(public answer: string, public userId: number) {}
}

@CommandHandler(AnswerPairQuizGameCommand)
export class AnswerPairQuizGameUseCase
  implements ICommandHandler<AnswerPairQuizGameCommand>
{
  constructor(
    private readonly dataSource: DataSource,
    private readonly pairQuizGameRepository: PairQuizGameRepository,
    private readonly pairQuizGameProgressRepository: PairQuizGameProgressRepository,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async execute(command: AnswerPairQuizGameCommand): Promise<number | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const myCurrentGame = await this.pairQuizGameRepository.findMyCurrentGame(
        command.userId,
        queryRunner.manager,
      );
      // TODO необходимо возвращать резулт нотификатион и прерывать транзакцию
      if (!myCurrentGame) throw new Error('Game not found');

      const questionAtempt =
        await this.pairQuizGameProgressRepository.findUnansweredQuestionByUserId(
          command.userId,
        );
      if (!questionAtempt) return null;

      questionAtempt.addAnswer(command.answer);
      // // 
      // if (questionAtempt.question.correctAnswers.includes(command.answer)) {
      //   questionAtempt.answerStatus = AnswerStatus.Correct;
      //   questionAtempt.score += 1;
      // } else {
      //   questionAtempt.answerStatus = AnswerStatus.Incorrect;
      // }
      // questionAtempt.addedAt = new Date();

      await queryRunner.manager.save(questionAtempt);

      const gameProgress =
        await this.pairQuizGameProgressRepository.findByGameId(
          myCurrentGame.id,
        );
      const countAnswers = gameProgress.length / 2;

      const gameOver =
        gameProgress.filter(
          (question) =>
            question.questionNumber === countAnswers && question.answerStatus,
        ).length === 2;

      if (gameOver) {
        queryRunner;
        myCurrentGame.finishGameDate = new Date();
        myCurrentGame.status = GameStatus.Finished;
        await queryRunner.manager.save(myCurrentGame);

        await this.addBonusPoint(
          myCurrentGame,
          gameProgress,
          countAnswers,
          queryRunner.manager,
        );
      } else if (questionAtempt.questionNumber === countAnswers) {
        this.startTheGameEndTimer(
          myCurrentGame.id,
          myCurrentGame.firstPlayerId === command.userId
            ? myCurrentGame.secondPlayerId!
            : myCurrentGame.firstPlayerId,
        );
      }

      await queryRunner.commitTransaction();
      return questionAtempt.id;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // TODO сделать через класс резулт нотиф
    } finally {
      await queryRunner.release();
    }

    return null;
  }

  private async addBonusPoint(
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

  private async startTheGameEndTimer(gameId: number, userId: number) {
    const milliseconds = 9000;
    const callback = () => {
      // TODO правильно ли тут сделано или можно было проще передать функцию с параметрами в callback
      this.completeTheGameAndAddBonusPoint(gameId, userId);
    };
    const timeout = setTimeout(callback, milliseconds);
    this.schedulerRegistry.addTimeout(gameId.toString(), timeout);
  }

  async completeTheGameAndAddBonusPoint(gameId: number, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const myCurrentGame = await this.pairQuizGameRepository.findMyCurrentGame(
        userId,
        queryRunner.manager,
      );
      if (!myCurrentGame) throw new Error('Failed to complete the game');

      if (myCurrentGame.status !== GameStatus.Finished) {
          myCurrentGame.finishGameDate = new Date();
          myCurrentGame.status = GameStatus.Finished;
        await queryRunner.manager.save(myCurrentGame);

        const gameProgress =
          await this.pairQuizGameProgressRepository.findByGameId(
            myCurrentGame.id,
          );

        for (const questionsAsked of gameProgress) {
          if (
            questionsAsked.userId === userId &&
            !questionsAsked.answerStatus
          ) {
            questionsAsked.answerStatus = AnswerStatus.Incorrect;
            questionsAsked.addedAt = new Date();
            await queryRunner.manager.save(questionsAsked);
          }
        }

        const countAnswers = gameProgress.length / 2;

        await this.addBonusPoint(
          myCurrentGame,
          gameProgress,
          countAnswers,
          queryRunner.manager,
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      Logger.error(error);
    } finally {
      await queryRunner.release();
    }
  }
}
