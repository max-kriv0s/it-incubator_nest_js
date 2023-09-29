import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PairQuizGameProgress } from '../entities/pair-quiz-game-progress.entity';
import { EntityManager, IsNull, Not, Repository } from 'typeorm';
import { CreateGameQuestionDto } from '../dto/create-game-question.dto';
import { GameStatus } from '../entities/pair-quiz-game.entity';

@Injectable()
export class PairQuizGameProgressRepository {
  constructor(
    @InjectRepository(PairQuizGameProgress)
    private readonly pairQuizGameProgressRepo: Repository<PairQuizGameProgress>,
  ) {}

  async save(question: PairQuizGameProgress) {
    await this.pairQuizGameProgressRepo.save(question);
  }

  async addQuestionsForGameByUserId(
    gameQuestion: CreateGameQuestionDto[],
    manager: EntityManager,
  ) {
    await manager
      .getRepository(PairQuizGameProgress)
      .createQueryBuilder()
      .insert()
      .into(PairQuizGameProgress)
      .values(gameQuestion)
      .execute();
  }

  async findUnansweredQuestionByUserId(
    userId: number,
  ): Promise<PairQuizGameProgress | null> {
    return this.pairQuizGameProgressRepo.findOne({
      where: {
        userId,
        answerStatus: IsNull(),
        game: { status: Not(GameStatus.Finished) },
      },
      relations: { question: true, game: true },
      order: { questionNumber: 'ASC' },
    });
  }

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<PairQuizGameProgress | null> {
    return manager.findOneBy(PairQuizGameProgress, { id });
  }

  async findByGameId(gameId: number) {
    return this.pairQuizGameProgressRepo.find({
      where: { gameId },
      order: { questionNumber: 'ASC' },
    });
  }
}
