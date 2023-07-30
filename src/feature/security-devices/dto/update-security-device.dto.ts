import { Types } from 'mongoose';

export class UpdateSecurityDeviceDto {
  readonly ip: string;
  readonly title: string;
  readonly lastActiveDate: Date;
  readonly expirationTime: Date;
  readonly userId: Types.ObjectId;
}

export class UpdateSecurityDeviceSqlDto {
  readonly ip: string;
  readonly title: string;
  readonly lastActiveDate: Date;
  readonly expirationTime: Date;
  readonly userId: number;
}
