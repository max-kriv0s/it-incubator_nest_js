import { Injectable } from '@nestjs/common';
import { CreateSecurityDeviceDto } from './dto/create-security-device.dto';
import { TokenDataDto } from '../auth/dto/token-data.dto';
import { UpdateSecurityDeviceSqlDto } from './dto/update-security-device.dto';
import { SecurityDevicesSqlRepository } from './db/security-devices.sql-repository';
import {
  ResultCodeError,
  ResultNotification,
} from '../../modules/notification';

@Injectable()
export class SecurityDevicesService {
  constructor(
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  async CreateSecurityDevice(
    userId: string,
    ip: string,
    userAgent: string,
  ): Promise<string | null> {
    const data: CreateSecurityDeviceDto = {
      ip: ip,
      title: this.getNameUserAgent(userAgent),
      userId: userId,
    };
    const device = await this.securityDevicesSqlRepository.createSecurityDevice(
      data,
    );
    return device ? device.id : null;
  }

  getNameUserAgent(userAgent?: string): string {
    return userAgent ? userAgent : 'Chrome';
  }

  async deleteAllDevicesSessionsByUserID(userId: string, deviceId: string) {
    await this.securityDevicesSqlRepository.deleteAllDevicesSessionsByUserID(
      userId,
      deviceId,
    );
  }

  async deleteUserSessionByDeviceID(
    deviceID: string,
    userId: string,
  ): Promise<ResultNotification<null>> {
    const deleteResult = new ResultNotification<null>();
    const securitySession =
      await this.securityDevicesSqlRepository.findSessionByDeviceID(deviceID);
    if (!securitySession) {
      deleteResult.addError('Device not found', ResultCodeError.NotFound);
      return deleteResult;
    }

    if (securitySession.userId !== userId) {
      deleteResult.addError('Access is denied', ResultCodeError.Forbidden);
      return deleteResult;
    }

    await this.securityDevicesSqlRepository.deleteUserSessionByDeviceID(
      deviceID,
      userId,
    );
    return deleteResult;
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

  async logoutUserSessionByDeviceID(deviceID: string, userId: string) {
    await this.securityDevicesSqlRepository.deleteUserSessionByDeviceID(
      deviceID,
      userId,
    );
  }

  async verifySecurityDeviceByToken(dataToken: TokenDataDto): Promise<boolean> {
    const securitySession =
      await this.securityDevicesSqlRepository.findUserSessionByDeviceID(
        dataToken.userId,
        dataToken.deviceId,
      );
    if (!securitySession) return false;

    return (
      securitySession.lastActiveDate.getTime() ===
        dataToken.issuedAd.getTime() &&
      securitySession.id === dataToken.deviceId &&
      securitySession.userId === dataToken.userId
    );
  }

  async deleteAllDevicesByUserID(userId: string) {
    await this.securityDevicesSqlRepository.deleteAllDevicesByUserID(userId);
  }
}
