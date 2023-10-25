import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TelegramUserAccounts } from '../entities/telegram-user-accounts.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TelegramUserAccountsRepository {
  constructor(
    @InjectRepository(TelegramUserAccounts)
    private readonly telegramUserAccountsRepo: Repository<TelegramUserAccounts>,
  ) {}

  async findByActivateCode(
    activateCode: string,
  ): Promise<TelegramUserAccounts | null> {
    return this.telegramUserAccountsRepo.findOneBy({ activateCode });
  }

  async save(account: TelegramUserAccounts) {
    await this.telegramUserAccountsRepo.save(account);
  }
}
