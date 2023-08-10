import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ApiCalls,
  ApiCallsDocument,
  ApiCallsModelType,
} from '../model/api-calls.schema';

@Injectable()
export class ApiCallsRepository {
  constructor(
    @InjectModel(ApiCalls.name) private ApyCallsModel: ApiCallsModelType,
  ) {}

  createApiCall(ip: string, url: string): ApiCallsDocument {
    return this.ApyCallsModel.createApiCall(ip, url, this.ApyCallsModel);
  }

  async save(apiCall: ApiCallsDocument): Promise<ApiCallsDocument> {
    return apiCall.save();
  }

  async countDocuments(
    ip: string,
    url: string,
    verificationDate: Date,
  ): Promise<number> {
    return this.ApyCallsModel.countDocuments({
      IP: ip,
      URL: url,
      date: { $gte: verificationDate },
    });
  }

  async deleteCalls() {
    await this.ApyCallsModel.deleteMany({});
  }
}
