import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SecurityDevices,
  SecurityDevicesDocument,
  SecurityDevicesModelType,
} from './security-devices.schema';
import { ViewSecurityDeviceDto } from './dto/view-security-device.dto';
import { Types } from 'mongoose';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectModel(SecurityDevices.name)
    private SecurityDevicesModel: SecurityDevicesModelType,
  ) {}
  async getAllDevicesSessionsByUserID(
    userId: string,
  ): Promise<ViewSecurityDeviceDto[] | null> {
    const devicesDB = await this.SecurityDevicesModel.find({
      userId: new Types.ObjectId(userId),
    }).exec();
    if (!devicesDB) return null;

    return devicesDB.map((device) =>
      this.securityDevicesDBTosecurityDevicesView(device),
    );
  }

  securityDevicesDBTosecurityDevicesView(
    device: SecurityDevicesDocument,
  ): ViewSecurityDeviceDto {
    return {
      ip: device.ip,
      title: device.title,
      lastActiveDate: device.lastActiveDate.toISOString(),
      deviceId: device._id.toString(),
    };
  }
}
