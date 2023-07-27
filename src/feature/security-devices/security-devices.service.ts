import { Injectable } from '@nestjs/common';
import { SecurityDevicesRepository } from './db/security-devices.repository';
import { CreateSecurityDeviceDto } from './dto/create-security-device.dto';
import { Types } from 'mongoose';
import { TokenDataDto } from '../auth/dto/token-data.dto';
import { ResultDeleteDevice } from './dto/result-delete-device.dto';
import {
  UpdateSecurityDeviceDto,
  UpdateSecurityDeviceSqlDto,
} from './dto/update-security-device.dto';
import { castToObjectId } from '../../utils';
import { SecurityDevicesSqlRepository } from './db/security-devices.sql-repository';
import { uuid } from 'uuidv4';

@Injectable()
export class SecurityDevicesService {
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async CreateSecurityDevice(
    dataRefreshTokenDto: TokenDataDto,
    ip: string,
    userAgent: string,
  ): Promise<string | null> {
    const data: CreateSecurityDeviceDto = {
      id: dataRefreshTokenDto.deviceId,
      ip: ip,
      title: this.getNameUserAgent(userAgent),
      lastActiveDate: dataRefreshTokenDto.issuedAd,
      expirationTime: dataRefreshTokenDto.expirationTime,
      userId: dataRefreshTokenDto.userId,
    };

    // const newSecurityDevices =
    //   this.securityDevicesRepository.CreateSecurityDevice(data);
    // await this.securityDevicesRepository.save(newSecurityDevices);

    // return newSecurityDevices.id;
    return this.securityDevicesSqlRepository.createSecurityDevice(data);
  }

  getNewSecurityDeviceId(): string {
    // return new Types.ObjectId().toString();
    return uuid();
  }

  getNameUserAgent(userAgent?: string): string {
    return userAgent ? userAgent : 'Chrome';
  }

  async deleteAllDevicesSessionsByUserID(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    return this.securityDevicesSqlRepository.deleteAllDevicesSessionsByUserID(
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
      await this.securityDevicesSqlRepository.findSessionByDeviceID(deviceID);
    if (!securitySession) return result;
    result.securityDeviceExists = true;

    if (securitySession.userId !== userId) return result;
    result.isUserSecurityDevice = true;

    result.securityDeviceDeleted =
      await this.securityDevicesSqlRepository.deleteUserSessionByDeviceID(
        deviceID,
        userId,
      );
    return result;
  }

  async updateSecurityDeviceSession(
    dataRefreshTokenDto: TokenDataDto,
    ip: string,
    userAgent: string,
  ): Promise<boolean> {
    const dataUpdate: UpdateSecurityDeviceSqlDto = {
      ip: ip,
      title: this.getNameUserAgent(userAgent),
      lastActiveDate: dataRefreshTokenDto.issuedAd,
      expirationTime: dataRefreshTokenDto.expirationTime,
      userId: dataRefreshTokenDto.userId,
    };

    return this.securityDevicesSqlRepository.updateSecurityDeviceSession(
      dataRefreshTokenDto.deviceId,
      dataUpdate,
    );
  }

  async logoutUserSessionByDeviceID(
    deviceID: string,
    userId: string,
  ): Promise<boolean> {
    return this.securityDevicesSqlRepository.deleteUserSessionByDeviceID(
      deviceID,
      userId,
    );
  }

  async verifySecurityDeviceByToken(dataToken: TokenDataDto): Promise<boolean> {
    const securitySession =
      await this.securityDevicesRepository.findUserSessionByDeviceID(
        dataToken.userId,
        dataToken.deviceId,
      );
    if (!securitySession) return false;

    return (
      securitySession.lastActiveDate.getTime() ===
        dataToken.issuedAd.getTime() &&
      securitySession._id.toString() === dataToken.deviceId &&
      securitySession.userId.toString() === dataToken.userId
    );
  }
}
