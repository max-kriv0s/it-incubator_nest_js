import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TelegramUpdateMessage } from '../../../../adapters/telegram.adapter';
import { TelegramUserAccountsRepository } from '../db/telegram-user-accounts.repository';
import { Logger } from '@nestjs/common';

export class UpdatingMessagesFromTelegramCommand {
  constructor(public payload: TelegramUpdateMessage) {}
}

@CommandHandler(UpdatingMessagesFromTelegramCommand)
export class updatingMessagesFromTelegramUseCase
  implements ICommandHandler<UpdatingMessagesFromTelegramCommand>
{
  private readonly logger = new Logger();

  constructor(
    private readonly telegramUserAccountsRepository: TelegramUserAccountsRepository,
  ) {}
  async execute(command: UpdatingMessagesFromTelegramCommand) {
    this.logger.log(command.payload);

    if (!command.payload.message) {
      return;
    }

    const text = command.payload.message.text;
    this.logger.log(`telegram text - ${text}`);

    if (text.startsWith('/start')) {
      const activateCode = text.split('=')[1];

      const telegtamAccount =
        await this.telegramUserAccountsRepository.findByActivateCode(
          activateCode,
        );
      if (telegtamAccount) {
        this.logger.log(command.payload);
        telegtamAccount.telegramId = command.payload.message.from.id;
        await this.telegramUserAccountsRepository.save(telegtamAccount);
      }
    }
  }
}
