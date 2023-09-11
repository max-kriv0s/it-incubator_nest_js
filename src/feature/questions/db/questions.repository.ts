import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepo: Repository<Question>,
  ) {}

  async save(question: Question) {
    await this.questionsRepo.save(question);
  }

  async deleteById(id: number): Promise<boolean> {
    const result = await this.questionsRepo.delete({ id });
    return result.affected ? true : false;
  }

  async findById(id: number): Promise<Question | null> {
    return this.questionsRepo.findOneBy({ id });
  }

  async randomQuestions(count: number): Promise<Question[]> {
    return this.questionsRepo
      .createQueryBuilder('q')
      .where('q.published = :published', { published: true })
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();
  }
}
