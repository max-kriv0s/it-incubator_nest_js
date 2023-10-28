import { BaseEntityClass } from '../../../../modules/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'TelegramUserAccounts' })
export class TelegramUserAccounts extends BaseEntityClass {
  @Column({ type: 'bigint', nullable: true })
  telegramId: number;

  @Column()
  activateCode: string;

  @Column()
  expirationTime: Date;
}
