import { Types } from 'mongoose';

export class CreateSecurityDeviceDto {
  readonly _id: Types.ObjectId;
  readonly ip: string;
  readonly title: string;
  readonly lastActiveDate: string;
  readonly expirationTime: string;
  readonly userId: Types.ObjectId;
}
