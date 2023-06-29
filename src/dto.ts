import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';

enum sortDirection {
  asc = 'asc',
  desc = 'desc',
}

export class QueryParams {
  @IsString()
  @IsOptional()
  readonly searchNameTerm: string;

  @IsString()
  @IsOptional()
  readonly pageNumber: string;

  @IsString()
  @IsOptional()
  readonly pageSize: string;

  @IsString()
  @IsOptional()
  readonly sortBy: string;

  @IsString()
  @IsOptional()
  @IsEnum(sortDirection)
  readonly sortDirection: sortDirection;
}

export class Paginator {
  readonly pagesCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
}

export class ParamIdDto {
  @IsMongoId()
  id: string;
}

export class ParamBlogIdDto {
  @IsMongoId()
  blogId: string;
}

export class ParamDeviceIdDto {
  @IsMongoId()
  deviceId: string;
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
