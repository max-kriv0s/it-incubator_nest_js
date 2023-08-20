import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SecurityDevice } from '../entities/security-device.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectRepository(SecurityDevice)
    private readonly securityDevicesRepository: Repository<SecurityDevice>,
  ) {}

  async deleteAllDevicesSessionsByUserID(userId: number, deviceId: number) {
    await this.securityDevicesRepository.delete({ userId, id: Not(deviceId) });
  }

  async deleteAllDevicesByUserID(userId: number) {
    await this.securityDevicesRepository.delete({ userId });
  }

  async deleteUserSessionByDeviceID(deviceId: number, userId: number) {
    await this.securityDevicesRepository.delete({ id: deviceId, userId });
  }

  async findSessionByDeviceID(
    deviceId: number,
  ): Promise<SecurityDevice | null> {
    const device = await this.securityDevicesRepository.findOneBy({
      id: deviceId,
    });
    if (!device) return null;
    return device;
  }

  async createSecurityDevice(
    securityDevice: SecurityDevice,
  ): Promise<SecurityDevice> {
    return this.securityDevicesRepository.save(securityDevice);
  }

  async save(securityDevice: SecurityDevice) {
    await this.securityDevicesRepository.save(securityDevice);
  }

  async findUserSessionByDeviceID(
    userId: number,
    deviceId: number,
  ): Promise<SecurityDevice | null> {
    const device = await this.securityDevicesRepository.findOneBy({
      id: deviceId,
      userId,
    });

    if (!device) return null;
    return device;
  }
}
