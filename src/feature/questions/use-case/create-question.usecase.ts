import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../db/questions.repository';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { validateOrRejectModel } from '../../../modules/validation';
import { Question } from '../entities/question.entity';

export class CreateQuestionCommand {
  constructor(public dto: CreateQuestionDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand>
{
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: CreateQuestionCommand): Promise<number> {
    await validateOrRejectModel(command.dto, CreateQuestionDto);

    const question = new Question();
    question.body = command.dto.body;
    question.correctAnswers = command.dto.correctAnswers;
    question.updatedAt = null;
    await this.questionsRepository.save(question);

    return question.id;
  }
}
