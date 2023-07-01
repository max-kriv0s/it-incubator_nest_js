import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseConfig } from '../../configuration/base.configuration';

@Injectable()
export class EmailConfig extends BaseConfig {
  constructor(protected configService: ConfigService) {
    super(configService);
  }

  getEmailSettings() {
    return {
      TECH_EMAIL: this.configService.get<string>('TECH_EMAIL') ?? '',
      TECH_EMAIL_PASSWORD:
        this.configService.get<string>('TECH_EMAIL_PASSWORD') ?? '',
    };
  }
}
