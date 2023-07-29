import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  SecurityDeviceByToken,
  SecurityDevicesRawSql,
  SecurityDevicesSql,
} from '../dto/security-devices-sql.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateSecurityDeviceDto } from '../dto/create-security-device.dto';
import { UpdateSecurityDeviceSqlDto } from '../dto/update-security-device.dto';
import { FORMERR } from 'dns';

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

  // TODO убрать возврат значения, так как негативного сценария нет в обработке
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

  async createSecurityDevice(
    securityDeviceDto: CreateSecurityDeviceDto,
  ): Promise<string | null> {
    const devices = await this.dataSource.query(
      `INSERT INTO public."SecurityDevices"
        ("Id", "Ip", "Title", "LastActiveDate", "ExpirationTime", "UserId")
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING "Id";`,
      [
        securityDeviceDto.id,
        securityDeviceDto.ip,
        securityDeviceDto.title,
        securityDeviceDto.lastActiveDate,
        securityDeviceDto.expirationTime,
        securityDeviceDto.userId,
      ],
    );

    if (!devices) return null;
    return devices[0].Id;
  }

  async updateSecurityDeviceSession(
    deviceId: string,
    dataUpdate: UpdateSecurityDeviceSqlDto,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public."SecurityDevices"
      SET "Ip" = $2, "Title" = $3, "LastActiveDate" = $4, "ExpirationTime" = $5, "UserId" = $6
      WHERE "Id" = $1`,
      [
        deviceId,
        dataUpdate.ip,
        dataUpdate.title,
        dataUpdate.lastActiveDate,
        dataUpdate.expirationTime,
        dataUpdate.userId,
      ],
    );
    return result.length === 2 && result[1] === 1;
  }

  async findUserSessionByDeviceID(
    userId: string,
    deviceId: string,
  ): Promise<SecurityDeviceByToken | null> {
    const devices = await this.dataSource.query(
      `SELECT "Id", "UserId", "LastActiveDate"
      FROM public."SecurityDevices"
      WHERE "Id" = $1 AND "UserId" = $2
      `,
      [deviceId, userId],
    );

    if (!devices.length) return null;
    return {
      id: devices[0].Id,
      userId: devices[0].UserId,
      lastActiveDate: devices[0].LastActiveDate,
    };
  }
}
