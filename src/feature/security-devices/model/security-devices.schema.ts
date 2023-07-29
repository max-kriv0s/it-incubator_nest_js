import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateSecurityDeviceDto } from '../dto/create-security-device.dto';
import { UpdateSecurityDeviceDto } from '../dto/update-security-device.dto';

export type SecurityDevicesDocument = HydratedDocument<SecurityDevices>;

@Schema()
export class SecurityDevices {
  _id: Types.ObjectId;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  lastActiveDate: Date;

  @Prop({ required: true })
  expirationTime: Date;

  @Prop({ required: true })
  userId: Types.ObjectId;

  static createSecurityDevices(
    securityDevicesDto: CreateSecurityDeviceDto,
    SecurityDevicesModel: SecurityDevicesModelType,
  ): SecurityDevicesDocument {
    return new SecurityDevicesModel(securityDevicesDto);
  }

  updateSecurityDeviceSession(dataUpdate: UpdateSecurityDeviceDto) {
    this.ip = dataUpdate.ip;
    this.title = dataUpdate.title;
    this.lastActiveDate = dataUpdate.lastActiveDate;
    this.expirationTime = dataUpdate.expirationTime;
    this.userId = dataUpdate.userId;
  }
}

export const SecurityDevicesSchema =
  SchemaFactory.createForClass(SecurityDevices);

SecurityDevicesSchema.methods = {
  updateSecurityDeviceSession:
    SecurityDevices.prototype.updateSecurityDeviceSession,
};

export type SecurityDevicesModelStaticType = {
  createSecurityDevices: (
    securityDevicesDto: CreateSecurityDeviceDto,
    SecurityDevicesModel: SecurityDevicesModelType,
  ) => SecurityDevicesDocument;
};

const securityDevicesStaticMethods: SecurityDevicesModelStaticType = {
  createSecurityDevices: SecurityDevices.createSecurityDevices,
};

SecurityDevicesSchema.statics = securityDevicesStaticMethods;

export type SecurityDevicesModelType = Model<SecurityDevices> &
  SecurityDevicesModelStaticType;
