import { Injectable } from '@nestjs/common';
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';
import { ApiCallsConfig } from 'src/feature/api-calls/configuration/api-calls.configuration';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  constructor(private readonly apiCallsConfig: ApiCallsConfig) {}

  createThrottlerOptions():
    | ThrottlerModuleOptions
    | Promise<ThrottlerModuleOptions> {
    const settings = this.apiCallsConfig.getApiCallsSettings();

    if (!settings.API_CALLS_INCLUDED) return {};

    return {
      ttl: settings.QUERY_CHECKING_TIME,
      limit: settings.MAX_COUNT_FREQUENT_REQUESTS_FOR_API,
    };
  }
}
