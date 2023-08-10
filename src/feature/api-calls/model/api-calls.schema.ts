import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type ApiCallsDocument = HydratedDocument<ApiCalls>;

@Schema()
export class ApiCalls {
  @Prop({ required: true })
  IP: string;

  @Prop({ required: true })
  URL: string;

  @Prop({ required: true })
  date: Date;

  static createApiCall(
    ip: string,
    url: string,
    ApiCallsModel: ApiCallsModelType,
  ): ApiCallsDocument {
    return new ApiCallsModel({ IP: ip, URL: url, date: new Date() });
  }
}

export const ApiCallSchema = SchemaFactory.createForClass(ApiCalls);

export type ApiCallModelStaticType = {
  createApiCall: (
    ip: string,
    url: string,
    ApiCallsModel: ApiCallsModelType,
  ) => ApiCallsDocument;
};

const apiCallStaticMethods: ApiCallModelStaticType = {
  createApiCall: ApiCalls.createApiCall,
};
ApiCallSchema.statics = apiCallStaticMethods;

export type ApiCallsModelType = Model<ApiCalls> & ApiCallModelStaticType;
