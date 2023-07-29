export class SecurityDevicesSqlDocument {
  id: number;
  ip: string;
  title: string;
  lastActiveDate: Date;
  expirationTime: Date;
  userId: number;
}
