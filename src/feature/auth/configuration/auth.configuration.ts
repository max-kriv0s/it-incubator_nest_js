import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../../../configuration/base.configuration';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthConfig extends BaseConfig {
  constructor(protected configService: ConfigService) {
    super(configService);
  }

  getBasicAuthParam() {
    const username = this.configService.get<string>('BASIC_AUTH_USERNAME');
    const password = this.configService.get<string>('BASIC_AUTH_PASSWORD');
    return { username: username, password: password };
  }

  getTokensSettings() {
    const JWT_SECRET_ACCESS_TOKEN =
      this.configService.get<string>('JWT_SECRET_ACCESS_TOKEN') ??
      'AM5G47fC3AZ2QxBUZoxD';
    const JWT_ACCESS_TOKEN_EXPIRES_IN =
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') ?? '10s';

    const JWT_SECRET_REFRESH_TOKEN =
      this.configService.get<string>('JWT_SECRET_REFRESH_TOKEN') ??
      'VNKyGTgpeVetIiUFsymC';
    const JWT_REFRESH_TOKEN_EXPIRES_IN =
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') ?? '20s';

    return {
      JWT_SECRET_ACCESS_TOKEN,
      JWT_ACCESS_TOKEN_EXPIRES_IN,
      JWT_SECRET_REFRESH_TOKEN,
      JWT_REFRESH_TOKEN_EXPIRES_IN,
    };
  }
}
