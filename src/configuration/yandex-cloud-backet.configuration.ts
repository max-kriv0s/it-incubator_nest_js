import { ConfigService } from '@nestjs/config';
import { BaseConfig } from './base.configuration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class YandexCloudBacketConfig extends BaseConfig {
  constructor(protected configService: ConfigService) {
    super(configService);
  }

  getSettings() {
    return {
      YANDEX_CLOUD_BUCKET_NAME:
        this.configService.get<string>('YANDEX_CLOUD_BUCKET_NAME') ?? '',
      YANDEX_CLOUD_KEY_ID:
        this.configService.get<string>('YANDEX_CLOUD_KEY_ID') ?? '',
      YANDEX_CLOUD_SECRET_KEY:
        this.configService.get<string>('YANDEX_CLOUD_SECRET_KEY') ?? '',
      YANDEX_CLOUD_URL:
        this.configService.get<string>('YANDEX_CLOUD_URL') ?? '',
      YANDEX_CLOUD_URL_FILES:
        this.configService.get<string>('YANDEX_CLOUD_URL_FILES') ?? '',
    };
  }
}
