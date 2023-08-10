import { Types } from 'mongoose';
import { FieldError } from './dto';

export function castToObjectId(value: string): Types.ObjectId {
  return new Types.ObjectId(value);
}

export function GetFieldError(message: string, field: string): FieldError {
  return { message, field };
}

// interface IRawSqlDocument {
//   id: number;
// }

// interface ISqlDocument {
//   id: string;
// }

// export function convertRawSqlToSqlDocument<
//   RawType,
//   Key extends keyof RawType,
//   SqlType,
// >(rawDocument: RawType, conversionField: Key[]): SqlType {
//   const newDocument: O = {};

//   for (const key in rawDocument) {
//     if (conversionField.includes(key)) {
//       newDocument[key] = rawDocument[key].toString();
//     }
//   }

// }
