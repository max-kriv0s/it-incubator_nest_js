import { ConfigService } from '@nestjs/config';

export class BaseConfig {
  constructor(protected configService: ConfigService) {}

  protected getNumber(key: string, defaultValue?: number) {
    const value = this.configService.get(key);
    const parsedValue = Number(value);

    if (isNaN(parsedValue)) {
      if (defaultValue) {
        return defaultValue;
      }
      throw new Error(
        `Invalid configuration for ${key}: can't parse to number`,
      );
    }
    return parsedValue;
  }
}
