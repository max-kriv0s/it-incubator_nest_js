import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SecurityDevices,
  SecurityDevicesDocument,
  SecurityDevicesModelType,
} from './security-devices.schema';
import { CreateSecurityDeviceDto } from './dto/create-security-device.dto';
import { Types } from 'mongoose';

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
      userId: new Types.ObjectId(userId),
      _id: { $ne: new Types.ObjectId(deviceId) },
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
      _id: new Types.ObjectId(deviceID),
      userId: new Types.ObjectId(userId),
    });
    return result.deletedCount === 1;
  }
}
