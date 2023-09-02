import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../entities/question.entity';
import { Repository } from 'typeorm';
import { QuestionViewDto } from '../dto/view-question.dto';
import {
  PublishedStatusEnum,
  QuestionQueryDto,
  SortDirection,
} from '../dto/question-query.dto';
import { IPaginator } from '../../../dto';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepo: Repository<Question>,
  ) {}

  async getAllQuestionsView(
    queryParams: QuestionQueryDto,
    paginator: IPaginator<QuestionViewDto>,
  ) {
    const sortBy = queryParams.sortBy ? queryParams.sortBy : 'createdAt';
    const sortDirection = queryParams.sortDirection || SortDirection.desc;
    const bodySearchTerm = queryParams.bodySearchTerm || '';
    const publishedStatus =
      queryParams.publishedStatus || PublishedStatusEnum.all;

    const query = this.questionsRepo.createQueryBuilder('q');
    if (bodySearchTerm) {
      query.andWhere('q."body" ILIKE :bodySearchTerm', {
        bodySearchTerm: `%${bodySearchTerm}%`,
      });
    }
    if (publishedStatus !== PublishedStatusEnum.all) {
      query.andWhere('q."published" = :published', {
        published: publishedStatus === PublishedStatusEnum.published,
      });
    }

    const [questions, totalCount] = await query
      .orderBy(`q.${sortBy}`, sortDirection === 'desc' ? 'DESC' : 'ASC')
      .limit(paginator.pageSize)
      .offset(paginator.skip)
      .getManyAndCount();

    const questionsView = questions.map((question) =>
      this.convertToQuestionView(question),
    );
    return paginator.paginate(totalCount, questionsView);
  }

  async getQuestionViewById(id: number): Promise<QuestionViewDto | null> {
    const question = await this.questionsRepo.findOneBy({ id });
    if (!question) return null;

    return this.convertToQuestionView(question);
  }

  private convertToQuestionView(question: Question): QuestionViewDto {
    return {
      id: question.id.toString(),
      body: question.body,
      correctAnswers: question.correctAnswers,
      published: question.published,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    };
  }
}
