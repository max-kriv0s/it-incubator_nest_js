import { Injectable } from '@nestjs/common';
import { ApiCallsRepository } from './db/api-calls.repository';
import { ApiCallsConfig } from './configuration/api-calls.configuration';

@Injectable()
export class ApiCallsService {
  constructor(
    private readonly apiCallsRepository: ApiCallsRepository,
    private readonly apiCallsConfig: ApiCallsConfig,
  ) {}

  async addСallRecord(ip: string, url: string): Promise<boolean> {
    const newApiCall = this.apiCallsRepository.createApiCall(ip, url);
    await this.apiCallsRepository.save(newApiCall);

    return true;
  }

  async requestAllowed(ip: string, url: string): Promise<boolean> {
    const settings = this.apiCallsConfig.getApiCallsSettings();

    const verificationDate = new Date();
    verificationDate.setSeconds(
      verificationDate.getSeconds() - settings.QUERY_CHECKING_TIME,
    );

    const countRequest = await this.apiCallsRepository.countDocuments(
      ip,
      url,
      verificationDate,
    );
    return countRequest <= settings.MAX_COUNT_FREQUENT_REQUESTS_FOR_API;
  }
}
