import { Types } from 'mongoose';

export function CastToObjectId(value: string): Types.ObjectId {
  return new Types.ObjectId(value);
}
