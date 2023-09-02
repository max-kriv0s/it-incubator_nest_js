import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth/guard/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateQuestionCommand } from './use-case/create-question.usecase';
import { QuestionsQueryRepository } from './db/questions-query.repository';
import {
  PaginatorQuestionView,
  QuestionViewDto,
} from './dto/view-question.dto';
import { IdIntegerValidationPipe } from 'src/modules/pipes/id-integer-validation.pipe';
import { QuestionDeleteCommand } from './use-case/question-delete.usecase';
import { QUESTION_NOT_FOUND_ERROR } from './constants/questions.constants';
import { QuestionUpdateDto } from './dto/question-update.dto';
import { QuestionUpdateCommand } from './use-case/question-update.usecase';
import { QuestionPublishDto } from './dto/question-publish.dto';
import { QuestionPublishUnpublishCommand } from './use-case/question-publish-unpublish.usecase';
import { QuestionQueryDto } from './dto/question-query.dto';

@UseGuards(BasicAuthGuard)
@Controller('sa/quiz/questions')
export class QuestionsController {
  constructor(
    private commandBus: CommandBus,
    private readonly questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  @Get()
  async getQuestions(@Query() queryParams: QuestionQueryDto) {
    const paginator = new PaginatorQuestionView(
      +queryParams.pageNumber,
      +queryParams.pageSize,
    );
    return this.questionsQueryRepository.getAllQuestionsView(
      queryParams,
      paginator,
    );
  }

  @Post()
  async createQuestion(
    @Body() dto: CreateQuestionDto,
  ): Promise<QuestionViewDto> {
    const questionId: number = await this.commandBus.execute(
      new CreateQuestionCommand(dto),
    );

    const questionView =
      await this.questionsQueryRepository.getQuestionViewById(questionId);

    if (!questionView) throw new NotFoundException();
    return questionView;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteQuestion(@Param('id', IdIntegerValidationPipe) id: string) {
    const isDeleted = await this.commandBus.execute(
      new QuestionDeleteCommand(+id),
    );
    if (!isDeleted) throw new NotFoundException(QUESTION_NOT_FOUND_ERROR);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateQuestion(
    @Param('id', IdIntegerValidationPipe) id: string,
    @Body() dto: QuestionUpdateDto,
  ) {
    const isUpdate = await this.commandBus.execute(
      new QuestionUpdateCommand(+id, dto),
    );
    if (!isUpdate) throw new NotFoundException(QUESTION_NOT_FOUND_ERROR);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/publish')
  async publishUnpublishQuestion(
    @Param('id', IdIntegerValidationPipe) id: string,
    @Body() dto: QuestionPublishDto,
  ) {
    const isUpdate = await this.commandBus.execute(
      new QuestionPublishUnpublishCommand(+id, dto),
    );
    if (!isUpdate) throw new NotFoundException(QUESTION_NOT_FOUND_ERROR);
  }
}
