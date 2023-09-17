import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { GameStatus, PairQuizGame } from '../entities/pair-quiz-game.entity';
import {
  Answer,
  PairQuizGameViewDto,
  PlayerProgress,
} from '../dto/pair-quiz-game-view.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { Question } from 'src/feature/questions/entities/question.entity';
import { PairQuizGameStatisticViewDto } from '../dto/pair-quiz-game-statistic-view.dto';

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
      pairCreatedDate: infoGame.pairCreateDate.toISOString(),
      startGameDate: infoGame.startGame
        ? infoGame.startGame.toISOString()
        : null,
      finishGameDate: infoGame.finishGame
        ? infoGame.finishGame.toISOString()
        : null,
    };
  }
}
