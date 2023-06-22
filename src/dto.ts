import { IsMongoId } from 'class-validator';

export class QueryParams {
  readonly searchNameTerm: string;
  readonly pageNumber: string;
  readonly pageSize: string;
  readonly sortBy: string;
  readonly sortDirection: 'asc' | 'desc';
}

export class Paginator {
  readonly pagesCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
}

export class ParamsDto {
  @IsMongoId()
  id: string;
}

// export class ObjectTeamIdParameterDTO {
//   @IsMongoIdObject({ message: 'Incorrect objectId' })
//   teamId: string;
// }

// export function IsMosngoIdObject(validationOptions?: ValidationOptions) {
//   return function (object: any, propertyName: string) {
//     registerDecorator({
//       name: 'IsMongoIdObject',
//       target: object.constructor,
//       propertyName: propertyName,
//       constraints: [],
//       options: validationOptions,
//       validator: {
//         validate(value: any) {
//           return ObjectId.isValid(value);
//         },
//       },
//     });
//   };
// }

// export enum ResultCode {
//   Success,
//   NotFound,
//   ServerError,
// }

// export type ResultDto<T> = {
//   data: T | null;
//   code: ResultCode;
//   errorMessage: string;
// };
