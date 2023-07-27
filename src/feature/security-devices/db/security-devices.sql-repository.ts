import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  SecurityDevicesRawSql,
  SecurityDevicesSql,
} from '../dto/security-devices-sql.dto';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class SecurityDevicesSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async deleteSecurityDevices() {
    await this.dataSource.query(`
    DELETE FROM public."Users"`);
  }

  async deleteAllDevicesSessionsByUserID(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    await this.dataSource.query(
      `DELETE FROM public."SecurityDevices"
	    WHERE "Id" != $1 AND "UserId" = $2;`,
      [deviceId, userId],
    );

    return true;
  }

  async deleteAllDevicesByUserID(userId: string): Promise<boolean> {
    await this.dataSource.query(
      `DELETE FROM public."SecurityDevices"
	    WHERE "UserId" = $1;`,
      [userId],
    );

    return true;
  }

  async findSessionByDeviceID(
    deviceId: string,
  ): Promise<SecurityDevicesSql | null> {
    const devices = await this.dataSource.query(
      `SELECT "Id", "UserId"
      FROM public."SecurityDevices"
      WHERE "Id" = $1`,
      [deviceId],
    );
    if (!devices.length) return null;
    return this.convertSecurityDeviceRawSqlToSql(devices[0]);
  }

  convertSecurityDeviceRawSqlToSql(
    device: SecurityDevicesRawSql,
  ): SecurityDevicesSql {
    return {
      id: device.Id,
      userId: device.UserId,
    };
  }

  async deleteUserSessionByDeviceID(
    deviceID: string,
    userId: string,
  ): Promise<boolean> {
    await this.dataSource.query(
      `DELETE FROM public."SecurityDevices"
	    WHERE "Id" = $1 AND "UserId" = $2;`,
      [deviceID, userId],
    );

    return true;
  }
}
