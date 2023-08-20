import { Injectable } from '@nestjs/common';
import { ViewSecurityDeviceDto } from '../dto/view-security-device.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityDevice } from '../entities/security-device.entity';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectRepository(SecurityDevice)
    private readonly securityDevicesRepository: Repository<SecurityDevice>,
  ) {}
  async getAllDevicesSessionsByUserID(
    userId: number,
  ): Promise<ViewSecurityDeviceDto[] | null> {
    const devices = await this.securityDevicesRepository.find({
      where: { userId },
    });
    if (!devices) return null;

    return devices.map((device) =>
      this.securityDevicesDBTosecurityDevicesView(device),
    );
  }

  securityDevicesDBTosecurityDevicesView(
    device: SecurityDevice,
  ): ViewSecurityDeviceDto {
    return {
      ip: device.ip,
      title: device.title,
      lastActiveDate: device.lastActiveDate.toISOString(),
      deviceId: device.id.toString(),
    };
  }
}
