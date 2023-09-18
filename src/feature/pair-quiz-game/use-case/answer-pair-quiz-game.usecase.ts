import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PairQuizGameRepository } from '../db/pair-quiz-game.repository';
import { AnswerStatus } from '../entities/pair-quiz-game-progress.entity';
import { PairQuizGameProgressRepository } from '../db/pair-quiz-game-progress.repository';
import { GameStatus, PairQuizGame } from '../entities/pair-quiz-game.entity';
import { DataSource, EntityManager } from 'typeorm';

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
  ) {}

  async execute(command: AnswerPairQuizGameCommand): Promise<number | null> {
    const question =
      await this.pairQuizGameProgressRepository.findUnansweredQuestionByUserId(
        command.userId,
      );
    if (!question) return null;

    if (question.question.correctAnswers.includes(command.answer)) {
      question.answerStatus = AnswerStatus.Correct;
      question.score += 1;
    } else {
      question.answerStatus = AnswerStatus.Incorrect;
    }
    question.addedAt = new Date();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(question);

      const myCurrentGame = await this.pairQuizGameRepository.findMyCurrentGame(
        command.userId,
        queryRunner.manager,
      );
      if (!myCurrentGame) throw new Error('Game not found');
      const countAnswers = myCurrentGame.gameProgress.length / 2;

      const gameOver =
        myCurrentGame.gameProgress.filter(
          (question) =>
            question.questionNumber === countAnswers && question.answerStatus,
        ).length === 2;

      if (gameOver) {
        myCurrentGame.finishGameDate = new Date();
        myCurrentGame.status = GameStatus.Finished;
        await queryRunner.manager.save(myCurrentGame);

        await this.addBonusPoint(
          myCurrentGame,
          countAnswers,
          queryRunner.manager,
        );
      }

      await queryRunner.commitTransaction();
      return question.id;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return null;
  }

  private async addBonusPoint(
    myCurrentGame: PairQuizGame,
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

    for (const question of myCurrentGame.gameProgress) {
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
}
