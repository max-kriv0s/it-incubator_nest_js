import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../db/users.repository';
import { TelegramUserAccounts } from '../entities/telegram-user-accounts.entity';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { TelegramUserAccountsConfig } from '../configuration/telegram-user-accounts.configuration';
import { TelegramUserAccountsRepository } from '../db/telegram-user-accounts.repository';
import { TelegramAuthLinkView } from '../dto/telegram-auth-link-view.dto';

export class GenerateAuthBotLinkCommand {
  constructor(public userId: number) {}
}

@CommandHandler(GenerateAuthBotLinkCommand)
export class GenerateAuthBotLinkUseCase
  implements ICommandHandler<GenerateAuthBotLinkCommand>
{
  constructor(
    private readonly telegramUserAccountsConfig: TelegramUserAccountsConfig,
    private readonly usersRepository: UsersRepository,
    private readonly telegramUserAccountsRepository: TelegramUserAccountsRepository,
  ) {}

  async execute(
    command: GenerateAuthBotLinkCommand,
  ): Promise<TelegramAuthLinkView> {
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) throw new Error('Authorized user not found');

    const authBotLink = uuidv4();
    const authBotLinkExpirationDate = add(
      new Date(),
      this.telegramUserAccountsConfig.getAuthBotLinkExpirationIn(),
    );

    if (!user.telegramAccount) {
      const telegramAccount = new TelegramUserAccounts();
      telegramAccount.activateCode = authBotLink;
      telegramAccount.expirationTime = authBotLinkExpirationDate;
      await this.telegramUserAccountsRepository.save(telegramAccount);

      user.telegramAccount = telegramAccount;
      await this.usersRepository.save(user);
    } else {
      user.telegramAccount.activateCode = authBotLink;
      user.telegramAccount.expirationTime = authBotLinkExpirationDate;
      await this.telegramUserAccountsRepository.save(user.telegramAccount);
    }

    const urlBotLink = this.telegramUserAccountsConfig.getUrlBotLink();
    return {
      link: `${urlBotLink}?start=code=${user.telegramAccount.activateCode}`,
    };
  }
}
