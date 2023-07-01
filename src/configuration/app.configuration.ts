import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../configuration/base.configuration';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfig extends BaseConfig {
  constructor(protected configService: ConfigService) {
    super(configService);
  }

  getAppUrl() {
    return (
      this.configService.get('APP_URL') ?? `https://127.0.0.1:${this.getPort()}`
    );
  }

  getPort() {
    return this.getNumber('PORT', 5000);
  }
}
