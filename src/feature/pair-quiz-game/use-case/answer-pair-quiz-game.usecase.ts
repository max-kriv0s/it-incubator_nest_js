import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PairQuizGameRepository } from '../db/pair-quiz-game.repository';
import { PairQuizGameProgressRepository } from '../db/pair-quiz-game-progress.repository';
import { DataSource } from 'typeorm';
import { TransactionDecorator } from '../../../decorators/transaction.decorator';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { PairQuizGameService } from '../pair-quiz-game.service';

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
    private readonly pairQuizGameService: PairQuizGameService,
  ) {}

  async execute(
    command: AnswerPairQuizGameCommand,
  ): Promise<ResultNotification<number>> {
    const transactionDecorator = new TransactionDecorator(this.dataSource);

    return transactionDecorator.doOperation(
      command,
      async (command, manager) => {
        const res = new ResultNotification<number>();

        const myCurrentGame =
          await this.pairQuizGameRepository.findMyCurrentGame(
            command.userId,
            manager,
          );
        if (!myCurrentGame) {
          res.addError('Game not found', ResultCodeError.Forbidden);
          return res;
        }

        const questionAtempt =
          await this.pairQuizGameProgressRepository.findUnansweredQuestionByUserId(
            command.userId,
          );
        if (!questionAtempt) {
          res.addError('Question not found', ResultCodeError.Forbidden);
          return res;
        }
        questionAtempt.addAnswer(command.answer);
        await manager.save(questionAtempt);

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
          myCurrentGame.finishGame();
          await manager.save(myCurrentGame);

          await this.pairQuizGameService.addBonusPoint(
            myCurrentGame,
            gameProgress,
            countAnswers,
            manager,
          );
        }
        res.addData(questionAtempt.id);
        return res;
      },
    );
  }
}
