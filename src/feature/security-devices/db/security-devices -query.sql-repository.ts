import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ViewSecurityDeviceDto } from '../dto/view-security-device.dto';
import { SecurityDevicesSqlDocument } from '../model/security-devices-sql.model';

@Injectable()
export class SecurityDevicesQuerySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAllDevicesSessionsByUserID(
    userId: number,
  ): Promise<ViewSecurityDeviceDto[] | null> {
    const devices = await this.dataSource.query(
      `SELECT *
      FROM public."SecurityDevices"
      WHERE "UserId" = $1
        `,
      [userId],
    );
    if (!devices.length) return null;

    return devices.map((device) =>
      this.securityDevicesDBTosecurityDevicesView(device),
    );
  }

  securityDevicesDBTosecurityDevicesView(
    device: SecurityDevicesSqlDocument,
  ): ViewSecurityDeviceDto {
    return {
      ip: device.ip,
      title: device.title,
      lastActiveDate: device.lastActiveDate.toISOString(),
      deviceId: device.id.toString(),
    };
  }
}
