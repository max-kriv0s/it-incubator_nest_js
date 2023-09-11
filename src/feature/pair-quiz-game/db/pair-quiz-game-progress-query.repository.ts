import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PairQuizGameProgress } from '../entities/pair-quiz-game-progress.entity';
import { PairQuizGameProgressViewDto } from '../dto/pair-quiz-game-progress-view.dto';

@Injectable()
export class PairQuizGameProgressQueryRepository {
  constructor(
    @InjectRepository(PairQuizGameProgress)
    private readonly pairQuizGameProgressRepository: Repository<PairQuizGameProgress>,
  ) {}
  async findQuestionById(
    id: number,
  ): Promise<PairQuizGameProgressViewDto | null> {
    const question = await this.pairQuizGameProgressRepository.findOneBy({
      id,
    });
    if (!question) return null;
    return {
      questionId: question.id.toString(),
      answerStatus: question.answerStatus,
      addedAt: question.addedAt!.toISOString(),
    };
  }
}
