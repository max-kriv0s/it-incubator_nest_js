export class SecurityDevicesSql {
  id: string;
  userId: string;
}
export class SecurityDevicesRawSql {
  Id: string;
  Ip: string;
  Title: string;
  LastActiveDate: Date;
  UserId: string;
}

export class SecurityDeviceByToken {
  lastActiveDate: Date;
  id: string;
  userId: string;
}
