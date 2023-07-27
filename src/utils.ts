import { Types } from 'mongoose';
import { FieldError } from './dto';

export function castToObjectId(value: string): Types.ObjectId {
  return new Types.ObjectId(value);
}

export function GetFieldError(message: string, field: string): FieldError {
  return { message, field };
}

export function capitalizeFirstWord(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
