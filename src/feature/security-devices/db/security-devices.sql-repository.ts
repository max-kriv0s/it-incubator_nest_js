import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateSecurityDeviceDto } from '../dto/create-security-device.dto';
import { UpdateSecurityDeviceSqlDto } from '../dto/update-security-device.dto';
import {
  SecurityDevicesRawSqlDocument,
  SecurityDevicesSqlDocument,
  convertSecurityDeviceRawSqlToSqlDocument,
} from '../model/security-devices-sql.model';

@Injectable()
export class SecurityDevicesSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async deleteSecurityDevices() {
    await this.dataSource.query(`
    DELETE FROM public."SecurityDevices"`);
  }

  async deleteAllDevicesSessionsByUserID(userId: string, deviceId: string) {
    await this.dataSource.query(
      `DELETE FROM public."SecurityDevices"
	    WHERE "id" != $1 AND "userId" = $2;`,
      [+deviceId, +userId],
    );
  }

  async deleteAllDevicesByUserID(userId: string) {
    await this.dataSource.query(
      `DELETE FROM public."SecurityDevices"
	    WHERE "userId" = $1;`,
      [+userId],
    );
  }

  async deleteUserSessionByDeviceID(deviceID: string, userId: string) {
    await this.dataSource.query(
      `DELETE FROM public."SecurityDevices"
	    WHERE "id" = $1 AND "userId" = $2;`,
      [+deviceID, +userId],
    );
  }

  async findSessionByDeviceID(
    deviceId: string,
  ): Promise<SecurityDevicesSqlDocument | null> {
    const devicesRaw: SecurityDevicesRawSqlDocument[] =
      await this.dataSource.query(
        `SELECT *
      FROM public."SecurityDevices"
      WHERE "id" = $1`,
        [+deviceId],
      );
    if (!devicesRaw.length) return null;
    return convertSecurityDeviceRawSqlToSqlDocument(devicesRaw[0]);
  }

  async createSecurityDevice(
    securityDeviceDto: CreateSecurityDeviceDto,
  ): Promise<SecurityDevicesSqlDocument | null> {
    const devicesRaw: SecurityDevicesRawSqlDocument =
      await this.dataSource.query(
        `INSERT INTO public."SecurityDevices"
        ("ip", "title", "userId")
       VALUES ($1, $2, $3) RETURNING *;`,
        [
          securityDeviceDto.ip,
          securityDeviceDto.title,
          +securityDeviceDto.userId,
        ],
      );

    if (!devicesRaw) return null;
    return convertSecurityDeviceRawSqlToSqlDocument(devicesRaw[0]);
  }

  async updateSecurityDeviceSession(
    deviceId: string,
    dataUpdate: UpdateSecurityDeviceSqlDto,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public."SecurityDevices"
      SET "ip" = $2, "title" = $3, "lastActiveDate" = $4, "expirationTime" = $5, "userId" = $6
      WHERE "id" = $1`,
      [
        +deviceId,
        dataUpdate.ip,
        dataUpdate.title,
        dataUpdate.lastActiveDate,
        dataUpdate.expirationTime,
        +dataUpdate.userId,
      ],
    );
    return result.length === 2 && result[1] === 1;
  }

  async findUserSessionByDeviceID(
    userId: string,
    deviceId: string,
  ): Promise<SecurityDevicesSqlDocument | null> {
    const devicesRaw: SecurityDevicesRawSqlDocument[] =
      await this.dataSource.query(
        `SELECT *
        FROM public."SecurityDevices"
        WHERE "id" = $1 AND "userId" = $2
        `,
        [+deviceId, +userId],
      );

    if (!devicesRaw.length) return null;
    return convertSecurityDeviceRawSqlToSqlDocument(devicesRaw[0]);
  }
}
