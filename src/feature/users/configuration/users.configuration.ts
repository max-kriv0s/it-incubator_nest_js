import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../../../configuration/base.configuration';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersConfig extends BaseConfig {
  constructor(protected configService: ConfigService) {
    super(configService);
  }

  getCodeLifeTime() {
    return { hours: 1 };
  }
}
