import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../db/questions.repository';
import { QuestionUpdateDto } from '../dto/question-update.dto';
import { validateOrRejectModel } from '../../../modules/validation';

export class QuestionUpdateCommand {
  constructor(public id: number, public dto: QuestionUpdateDto) {}
}

@CommandHandler(QuestionUpdateCommand)
export class QuestionUpdateUseCase
  implements ICommandHandler<QuestionUpdateCommand>
{
  constructor(private readonly questionsRepository: QuestionsRepository) {}
  async execute(command: QuestionUpdateCommand): Promise<boolean> {
    await validateOrRejectModel(command.dto, QuestionUpdateDto);

    const question = await this.questionsRepository.findById(command.id);
    if (!question) return false;

    question.body = command.dto.body;
    question.correctAnswers = command.dto.correctAnswers;
    await this.questionsRepository.save(question);

    return true;
  }
}
