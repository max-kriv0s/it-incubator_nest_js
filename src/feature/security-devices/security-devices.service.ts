import { Injectable } from '@nestjs/common';
import { TokenDataDto } from '../auth/dto/token-data.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../modules/notification';
import { SecurityDevicesRepository } from './db/security-devices.repository';
import { SecurityDevice } from './entities/security-device.entity';

@Injectable()
export class SecurityDevicesService {
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async CreateSecurityDevice(
    userId: number,
    ip: string,
    userAgent: string,
  ): Promise<number> {
    const newDevice = new SecurityDevice();
    newDevice.ip = ip;
    newDevice.title = this.getNameUserAgent(userAgent);
    newDevice.userId = userId;
    await this.securityDevicesRepository.createSecurityDevice(newDevice);
    return newDevice.id;
  }

  getNameUserAgent(userAgent?: string): string {
    return userAgent ? userAgent : 'Chrome';
  }

  async deleteAllDevicesSessionsByUserID(userId: number, deviceId: number) {
    await this.securityDevicesRepository.deleteAllDevicesSessionsByUserID(
      userId,
      deviceId,
    );
  }

  async deleteUserSessionByDeviceID(
    deviceId: number,
    userId: number,
  ): Promise<ResultNotification<null>> {
    const deleteResult = new ResultNotification<null>();
    const securitySession =
      await this.securityDevicesRepository.findSessionByDeviceID(deviceId);
    if (!securitySession) {
      deleteResult.addError('Device not found', ResultCodeError.NotFound);
      return deleteResult;
    }

    if (securitySession.userId !== userId) {
      deleteResult.addError('Access is denied', ResultCodeError.Forbidden);
      return deleteResult;
    }

    await this.securityDevicesRepository.deleteUserSessionByDeviceID(
      deviceId,
      userId,
    );
    return deleteResult;
  }

  async updateSecurityDeviceSession(
    dataRefreshTokenDto: TokenDataDto,
    ip: string,
    userAgent: string,
  ): Promise<boolean> {
    const device = await this.securityDevicesRepository.findSessionByDeviceID(
      dataRefreshTokenDto.deviceId,
    );
    if (!device) return false;

    device.ip = ip;
    device.title = this.getNameUserAgent(userAgent);
    device.lastActiveDate = dataRefreshTokenDto.issuedAd;
    device.expirationTime = dataRefreshTokenDto.expirationTime;
    device.userId = dataRefreshTokenDto.userId;

    await this.securityDevicesRepository.save(device);
    return true;
  }

  async logoutUserSessionByDeviceID(deviceID: number, userId: number) {
    await this.securityDevicesRepository.deleteUserSessionByDeviceID(
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
      securitySession.id === dataToken.deviceId &&
      securitySession.userId === dataToken.userId
    );
  }

  async deleteAllDevicesByUserID(userId: number) {
    await this.securityDevicesRepository.deleteAllDevicesByUserID(userId);
  }
}
