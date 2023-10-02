import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PairQuizGameRepository } from '../db/pair-quiz-game.repository';
import { GameStatus, PairQuizGame } from '../entities/pair-quiz-game.entity';
import { PairQuizGameProgressRepository } from '../db/pair-quiz-game-progress.repository';
import { QuestionsRepository } from '../../../feature/questions/db/questions.repository';
import { CreateGameQuestionDto } from '../dto/create-game-question.dto';
import { DataSource, EntityManager } from 'typeorm';

export class CreatePairQuizGameCommand {
  constructor(public userId: number) {}
}

@CommandHandler(CreatePairQuizGameCommand)
export class CreatePairQuizGameUseCase
  implements ICommandHandler<CreatePairQuizGameCommand>
{
  constructor(
    private readonly dataSource: DataSource,
    private readonly pairQuizGameRepository: PairQuizGameRepository,
    private readonly pairQuizGameProgressRepository: PairQuizGameProgressRepository,
    private readonly questionsRepository: QuestionsRepository,
  ) {}
  async execute(command: CreatePairQuizGameCommand): Promise<number | null> {
    const game = await this.pairQuizGameRepository.findOpenGameByUserId(
      command.userId,
    );
    if (game !== null) return null;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let activeGame = await this.pairQuizGameRepository.findGamePending(
        queryRunner.manager,
      );
      if (!activeGame) {
        activeGame = await this.createNewGame(command.userId);
        await queryRunner.manager.save(activeGame);
      } else {
        activeGame.secondPlayerId = command.userId;
        activeGame.status = GameStatus.Active;
        activeGame.startGameDate = new Date();
        await queryRunner.manager.save(activeGame);

        await this.addQuestionsForGame(activeGame, queryRunner.manager);
      }

      await queryRunner.commitTransaction();

      return activeGame.id;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return null;
  }

  private async createNewGame(userId: number): Promise<PairQuizGame> {
    const game = new PairQuizGame();
    game.firstPlayerId = userId;
    return game;
  }

  private async addQuestionsForGame(
    game: PairQuizGame,
    manager: EntityManager,
  ) {
    const randomQuestions = await this.questionsRepository.randomQuestions(5);
    const questionsPlayers: CreateGameQuestionDto[] = [];

    let questionNumber = 1;
    for (const question of randomQuestions) {
      const questionFirstPlayer: CreateGameQuestionDto = {
        gameId: game.id,
        userId: game.firstPlayerId,
        questionId: question.id,
        questionNumber: questionNumber,
      };
      const questionSecondPlayer: CreateGameQuestionDto = {
        gameId: game.id,
        userId: game.secondPlayerId!,
        questionId: question.id,
        questionNumber: questionNumber,
      };
      questionsPlayers.push(questionFirstPlayer);
      questionsPlayers.push(questionSecondPlayer);
      questionNumber += 1;
    }
    await this.pairQuizGameProgressRepository.addQuestionsForGameByUserId(
      questionsPlayers,
      manager,
    );
  }
}
