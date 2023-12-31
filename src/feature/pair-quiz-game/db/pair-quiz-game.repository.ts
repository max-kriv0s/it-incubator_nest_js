import { InjectRepository } from '@nestjs/typeorm';
import { GameStatus, PairQuizGame } from '../entities/pair-quiz-game.entity';
import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PairQuizGameRepository {
  constructor(
    @InjectRepository(PairQuizGame)
    private readonly pairQuizGameRepo: Repository<PairQuizGame>,
  ) {}

  async save(game: PairQuizGame) {
    await this.pairQuizGameRepo.save(game);
  }

  async findOpenGameByUserId(userId: number): Promise<PairQuizGame | null> {
    return this.pairQuizGameRepo
      .createQueryBuilder('game')
      .where('game.status != :statusFinished', {
        statusFinished: GameStatus.Finished,
      })
      .andWhere(
        '(game."firstPlayerId" = :userId OR game."secondPlayerId" = :userId)',
        { userId },
      )
      .getOne();
  }

  async findGamePending(manager: EntityManager): Promise<PairQuizGame | null> {
    return manager
      .getRepository(PairQuizGame)
      .createQueryBuilder('game')
      .setLock('pessimistic_write')
      .where('game.status = :statusPending', {
        statusPending: GameStatus.PendingSecondPlayer,
      })
      .getOne();
  }

  async findMyCurrentGame(
    userId: number,
    manager: EntityManager,
  ): Promise<PairQuizGame | null> {
    return (
      manager
        .getRepository(PairQuizGame)
        .createQueryBuilder('game')
        .setLock('pessimistic_write', undefined, ['game'])
        // .leftJoinAndSelect('game.gameProgress', 'gameProgress')
        .where('game."status" = :gameStatusActive', {
          gameStatusActive: GameStatus.Active,
        })
        .andWhere(
          `(game."firstPlayerId" = :userId OR game."secondPlayerId" = :userId)`,
          { userId },
        )
        // .orderBy('gameProgress.questionNumber', 'ASC')
        .getOne()
    );
  }
}
