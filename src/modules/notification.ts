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
  field: string;
};

export class ResultNotification<T = null> {
  constructor(data: T | null = null) {
    this.data = data;
  }

  code: ResultCodeError = 0;
  data: T | null = null;
  message = '';
  field = '';

  hasError() {
    return this.code !== 0;
  }

  addError(message: string, code: number | null = null, field = '') {
    this.code = code ?? 1;
    this.message = message;
    this.field = field;
  }

  getError(): ResultNotificationErrorType {
    return { message: this.message, code: this.code, field: this.field };
  }

  addData(data: T) {
    this.data = data;
  }

  getResult() {
    if (!this.hasError()) return this.data;

    switch (this.code) {
      case ResultCodeError.Forbidden:
        throw new ForbiddenException(this.message);
        break;
      case ResultCodeError.NotFound:
        throw new NotFoundException(this.message);
        break;
      default:
        throw new BadRequestException();
        break;
    }
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
