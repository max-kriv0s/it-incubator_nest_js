export class SecurityDevicesRawSqlDocument {
  id: number;
  ip: string;
  title: string;
  lastActiveDate: Date;
  expirationTime: Date;
  userId: number;
}

export class SecurityDevicesSqlDocument {
  id: string;
  ip: string;
  title: string;
  lastActiveDate: Date;
  expirationTime: Date;
  userId: string;
}

export function convertSecurityDeviceRawSqlToSqlDocument(
  device: SecurityDevicesRawSqlDocument,
): SecurityDevicesSqlDocument {
  return {
    ...device,
    id: device.id.toString(),
    userId: device.userId.toString(),
  };
}
