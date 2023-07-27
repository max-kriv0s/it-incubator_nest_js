import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SecurityDevicesRawSql } from '../dto/security-devices-sql.dto';
import { ViewSecurityDeviceDto } from '../dto/view-security-device.dto';

@Injectable()
export class SecurityDevicesQuerySqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAllDevicesSessionsByUserID(
    userId: string,
  ): Promise<ViewSecurityDeviceDto[] | null> {
    const devices = await this.dataSource.query(
      `SELECT "Id", "Ip", "Title", "LastActiveDate"
      FROM public."SecurityDevices"
      WHERE "userId" = $1
        `,
      [userId],
    );
    if (!devices.length) return null;

    return devices.map((device) =>
      this.securityDevicesDBTosecurityDevicesView(device),
    );
  }

  securityDevicesDBTosecurityDevicesView(
    device: SecurityDevicesRawSql,
  ): ViewSecurityDeviceDto {
    return {
      ip: device.Ip,
      title: device.Title,
      lastActiveDate: device.LastActiveDate.toISOString(),
      deviceId: device.Id,
    };
  }
}
