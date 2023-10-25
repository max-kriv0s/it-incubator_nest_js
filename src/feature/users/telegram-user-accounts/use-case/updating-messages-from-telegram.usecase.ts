import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TelegramUpdateMessage } from '../../../../adapters/telegram.adapter';
import { TelegramUserAccountsRepository } from '../db/telegram-user-accounts.repository';

export class UpdatingMessagesFromTelegramCommand {
  constructor(public payload: TelegramUpdateMessage) {}
}

@CommandHandler(UpdatingMessagesFromTelegramCommand)
export class updatingMessagesFromTelegramUseCase
  implements ICommandHandler<UpdatingMessagesFromTelegramCommand>
{
  constructor(
    private readonly telegramUserAccountsRepository: TelegramUserAccountsRepository,
  ) {}
  async execute(command: UpdatingMessagesFromTelegramCommand) {
    const text = command.payload.message.text;
    if (text.startsWith('/start')) {
      const activateCode = text.split('=')[1];

      const telegtamAccount =
        await this.telegramUserAccountsRepository.findByActivateCode(
          activateCode,
        );
      if (telegtamAccount) {
        console.log(command.payload);
        telegtamAccount.telegramId = command.payload.message.from.id;
        await this.telegramUserAccountsRepository.save(telegtamAccount);
      }
    }
  }
}
