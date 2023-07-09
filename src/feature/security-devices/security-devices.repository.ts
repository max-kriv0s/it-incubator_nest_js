import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SecurityDevices,
  SecurityDevicesDocument,
  SecurityDevicesModelType,
} from './security-devices.schema';
import { CreateSecurityDeviceDto } from './dto/create-security-device.dto';
import { castToObjectId } from '../../utils';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectModel(SecurityDevices.name)
    private SecurityDevicesModel: SecurityDevicesModelType,
  ) {}

  CreateSecurityDevice(
    securityDeviceDto: CreateSecurityDeviceDto,
  ): SecurityDevicesDocument {
    return this.SecurityDevicesModel.createSecurityDevices(
      securityDeviceDto,
      this.SecurityDevicesModel,
    );
  }

  async deleteSecurityDevices() {
    await this.SecurityDevicesModel.deleteMany({});
  }

  async save(
    securityDevices: SecurityDevicesDocument,
  ): Promise<SecurityDevicesDocument> {
    return securityDevices.save();
  }

  async deleteAllDevicesSessionsByUserID(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    const result = await this.SecurityDevicesModel.deleteMany({
      userId: castToObjectId(userId),
      _id: { $ne: castToObjectId(deviceId) },
    });

    return result.acknowledged;
  }

  async findSessionByDeviceID(
    deviceId: string,
  ): Promise<SecurityDevicesDocument | null> {
    return this.SecurityDevicesModel.findById(deviceId);
  }

  async deleteUserSessionByDeviceID(
    deviceID: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.SecurityDevicesModel.deleteOne({
      _id: castToObjectId(deviceID),
      userId: castToObjectId(userId),
    });
    return result.deletedCount === 1;
  }

  async findUserSessionByDeviceID(
    userId: string,
    deviceId: string,
  ): Promise<SecurityDevicesDocument | null> {
    return this.SecurityDevicesModel.findOne({
      _id: castToObjectId(deviceId),
      userId: castToObjectId(userId),
    });
  }

  async deleteAllDevicesByUserID(userId: string): Promise<boolean> {
    const result = await this.SecurityDevicesModel.deleteMany({
      userId: castToObjectId(userId),
    });

    return result.acknowledged;
  }
}
