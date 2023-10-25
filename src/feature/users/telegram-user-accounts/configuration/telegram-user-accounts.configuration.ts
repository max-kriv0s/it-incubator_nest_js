import { ConfigService } from '@nestjs/config';
import { BaseConfig } from '../../../../configuration/base.configuration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TelegramUserAccountsConfig extends BaseConfig {
  constructor(protected configService: ConfigService) {
    super(configService);
  }
  getAuthBotLinkExpirationIn() {
    return {
      minutes: this.getNumber('TELEGRAM_AUTH_LINK_EXPIRES_IN_MINUTES', 10),
    };
  }

  getUrlBotLink() {
    return `https://t.me/${this.configService.get<string>(
      'TELEGRAM_BOT_NAME',
    )}`;
  }
}
