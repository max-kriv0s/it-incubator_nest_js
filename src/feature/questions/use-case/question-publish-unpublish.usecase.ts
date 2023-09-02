import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionPublishDto } from '../dto/question-publish.dto';
import { QuestionsRepository } from '../db/questions.repository';

export class QuestionPublishUnpublishCommand {
  constructor(public id: number, public dto: QuestionPublishDto) {}
}

@CommandHandler(QuestionPublishUnpublishCommand)
export class QuestionPublishUnpublishUseCase
  implements ICommandHandler<QuestionPublishUnpublishCommand>
{
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: QuestionPublishUnpublishCommand): Promise<boolean> {
    const question = await this.questionsRepository.findById(command.id);
    if (!question) return false;

    question.published = command.dto.published;
    await this.questionsRepository.save(question);

    return true;
  }
}
