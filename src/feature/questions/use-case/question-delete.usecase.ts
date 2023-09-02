import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../db/questions.repository';

export class QuestionDeleteCommand {
  constructor(public id: number) {}
}

@CommandHandler(QuestionDeleteCommand)
export class QuestionDeleteUseCase
  implements ICommandHandler<QuestionDeleteCommand>
{
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: QuestionDeleteCommand): Promise<boolean> {
    return this.questionsRepository.deleteById(command.id);
  }
}
