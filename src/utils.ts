import { Types } from 'mongoose';

export function validID(id: string): boolean {
  return Types.ObjectId.isValid(id);
}
