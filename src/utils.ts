import { Types } from 'mongoose';
import { FieldError } from './dto';

export function castToObjectId(value: string): Types.ObjectId {
  return new Types.ObjectId(value);
}

export function GetFieldError(message: string, field: string): FieldError {
  return { message, field };
}
