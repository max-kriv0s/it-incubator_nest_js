import { Types } from 'mongoose';
import { ResultCode, ResultDto } from './dto';
import { HttpException, HttpStatus } from '@nestjs/common';

export function validID(id: string): boolean {
  return Types.ObjectId.isValid(id);
}


export function getResultDto<T>(
  code: ResultCode,
  data: T | null = null,
  errorMessage = '',
): ResultDto<T> {
  return {
    data: data,
    code: code,
    errorMessage: errorMessage,
  };
}

export function calcResultDto<T>(
  code: ResultCode,
  data: T,
  message: string,
): T {
  switch (code) {
    case ResultCode.Success:
      return data;
    case ResultCode.NotFound:
      throw new HttpException(message, HttpStatus.NOT_FOUND);
    case ResultCode.ServerError:
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    default:
      throw new HttpException('', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
