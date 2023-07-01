import { Injectable } from '@nestjs/common';
import { BaseConfig } from '../../../configuration/base.configuration';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiCallsConfig extends BaseConfig {
  constructor(protected configService: ConfigService) {
    super(configService);
  }

  getApiCallsSettings() {
    const QUERY_CHECKING_TIME = this.getNumber('QUERY_CHECKING_TIME', 10);
    const MAX_COUNT_FREQUENT_REQUESTS_FOR_API = this.getNumber(
      'MAX_COUNT_FREQUENT_REQUESTS_FOR_API',
      5,
    );
    const API_CALLS_INCLUDED = this.getNumber('API_CALLS_INCLUDED', 0);

    return {
      QUERY_CHECKING_TIME,
      MAX_COUNT_FREQUENT_REQUESTS_FOR_API,
      API_CALLS_INCLUDED: API_CALLS_INCLUDED === 0 ? false : true,
    };
  }
}
