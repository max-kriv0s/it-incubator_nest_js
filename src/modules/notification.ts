import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

export enum ResultCodeError {
  NotFound = 4004,
  Forbidden = 4003,
  Success = 0,
}

export type ResultNotificationErrorType = {
  message: string;
  code: number | null;
};

// export class NotificationExtension {
//   constructor(public message: string, public key: string | null) {}
// }

export class ResultNotification<T = null> {
  constructor(data: T | null = null) {
    this.data = data;
  }

  code: ResultCodeError = 0;
  data: T | null = null;
  message = '';

  hasError() {
    return this.code !== 0;
  }

  addError(message: string, code: number | null = null) {
    this.code = code ?? 1;
    this.message = message;
  }

  getError(): ResultNotificationErrorType {
    return { message: this.message, code: this.code };
  }

  addData(data: T) {
    this.data = data;
  }
}

export function replyByNotification<T = null>(
  result: ResultNotification<T>,
): any {
  if (!result.hasError()) return result.data;

  switch (result.code) {
    case ResultCodeError.Forbidden:
      throw new ForbiddenException(result.message);
      break;
    case ResultCodeError.NotFound:
      throw new NotFoundException(result.message);
      break;
    default:
      throw new BadRequestException();
      break;
  }
}
