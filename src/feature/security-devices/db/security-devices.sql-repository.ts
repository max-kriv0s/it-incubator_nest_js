import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateSecurityDeviceDto } from '../dto/create-security-device.dto';
import { UpdateSecurityDeviceSqlDto } from '../dto/update-security-device.dto';
import { SecurityDevicesSqlDocument } from '../model/security-devices-sql.model';

@Injectable()
export class SecurityDevicesSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async deleteSecurityDevices() {
    await this.dataSource.query(`
    DELETE FROM public."SecurityDevices"`);
  }

  async deleteAllDevicesSessionsByUserID(userId: number, deviceId: number) {
    await this.dataSource.query(
      `DELETE FROM public."SecurityDevices"
	    WHERE "id" != $1 AND "userId" = $2;`,
      [deviceId, userId],
    );
  }

  async deleteAllDevicesByUserID(userId: number) {
    await this.dataSource.query(
      `DELETE FROM public."SecurityDevices"
	    WHERE "userId" = $1;`,
      [userId],
    );
  }

  async deleteUserSessionByDeviceID(deviceID: number, userId: number) {
    await this.dataSource.query(
      `DELETE FROM public."SecurityDevices"
	    WHERE "id" = $1 AND "userId" = $2;`,
      [deviceID, userId],
    );
  }

  async findSessionByDeviceID(
    deviceId: number,
  ): Promise<SecurityDevicesSqlDocument | null> {
    const devices = await this.dataSource.query(
      `SELECT *
      FROM public."SecurityDevices"
      WHERE "id" = $1`,
      [deviceId],
    );
    if (!devices.length) return null;
    return devices[0];
  }

  async createSecurityDevice(
    securityDeviceDto: CreateSecurityDeviceDto,
  ): Promise<number | null> {
    const devices = await this.dataSource.query(
      `INSERT INTO public."SecurityDevices"
        ("id", "ip", "title", "lastActiveDate", "expirationTime", "userId")
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING "id";`,
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
    return devices[0].id;
  }

  async updateSecurityDeviceSession(
    deviceId: number,
    dataUpdate: UpdateSecurityDeviceSqlDto,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public."SecurityDevices"
      SET "ip" = $2, "title" = $3, "lastActiveDate" = $4, "expirationTime" = $5, "userId" = $6
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
    userId: number,
    deviceId: number,
  ): Promise<SecurityDevicesSqlDocument | null> {
    const devices = await this.dataSource.query(
      `SELECT *
      FROM public."SecurityDevices"
      WHERE "id" = $1 AND "userId" = $2
      `,
      [deviceId, userId],
    );

    if (!devices.length) return null;
    return devices[0];
  }
}
