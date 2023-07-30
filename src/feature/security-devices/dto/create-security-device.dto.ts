export class CreateSecurityDeviceDto {
  readonly id: number;
  readonly ip: string;
  readonly title: string;
  readonly lastActiveDate: Date;
  readonly expirationTime: Date;
  readonly userId: number;
}
