export class CreateSecurityDeviceDto {
  readonly id: string;
  readonly ip: string;
  readonly title: string;
  readonly lastActiveDate: Date;
  readonly expirationTime: Date;
  readonly userId: string;
}
