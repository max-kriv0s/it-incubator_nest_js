import { Types } from 'mongoose';

export class CreateSecurityDeviceDto {
  readonly _id: Types.ObjectId;
  readonly ip: string;
  readonly title: string;
  readonly lastActiveDate: Date;
  readonly expirationTime: Date;
  readonly userId: Types.ObjectId;
}
