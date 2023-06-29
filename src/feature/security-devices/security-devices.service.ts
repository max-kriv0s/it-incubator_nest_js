import { Injectable } from '@nestjs/common';
import { SecurityDevicesRepository } from './security-devices.repository';
import { CreateSecurityDeviceDto } from './dto/create-security-device.dto';
import { Types } from 'mongoose';
import { TokenDataDto } from '../auth/dto/token-data.dto';
import { ResultDeleteDevice } from './dto/result-delete-device.dto';

@Injectable()
export class SecurityDevicesService {
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async CreateSecurityDevice(
    dataRefreshTokenDto: TokenDataDto,
    ip: string,
    userAgent: string,
  ): Promise<string> {
    const data: CreateSecurityDeviceDto = {
      _id: new Types.ObjectId(dataRefreshTokenDto.deviceId),
      ip: ip,
      title: this.getNameUserAgent(userAgent),
      lastActiveDate: dataRefreshTokenDto.issuedAd,
      expirationTime: dataRefreshTokenDto.expirationTime,
      userId: new Types.ObjectId(dataRefreshTokenDto.userId),
    };

    const newSecurityDevices =
      this.securityDevicesRepository.CreateSecurityDevice(data);
    await this.securityDevicesRepository.save(newSecurityDevices);
    return newSecurityDevices._id.toString();
  }

  getNewSecurityDeviceId(): string {
    return new Types.ObjectId().toString();
  }

  getNameUserAgent(userAgent?: string): string {
    return userAgent ? userAgent : 'Chrome';
  }

  async deleteAllDevicesSessionsByUserID(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    return this.securityDevicesRepository.deleteAllDevicesSessionsByUserID(
      userId,
      deviceId,
    );
  }

  async deleteUserSessionByDeviceID(
    deviceID: string,
    userId: string,
  ): Promise<ResultDeleteDevice> {
    const result: ResultDeleteDevice = {
      securityDeviceExists: false,
      isUserSecurityDevice: false,
      securityDeviceDeleted: false,
    };

    const securitySession =
      await this.securityDevicesRepository.findSessionByDeviceID(deviceID);
    if (!securitySession) return result;
    result.securityDeviceExists = true;

    if (securitySession.userId.toString() !== userId) return result;
    result.isUserSecurityDevice = true;

    result.securityDeviceDeleted =
      await this.securityDevicesRepository.deleteUserSessionByDeviceID(
        deviceID,
        userId,
      );
    return result;
  }
}
