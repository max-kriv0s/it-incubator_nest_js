import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { GetFieldError } from '../../utils';

@Injectable()
export class IdIntegerValidationPipeTest implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param') {
      return value;
    }

    // if (
    //   value[value.length - 1] === ',' &&
    //   Number.isInteger(Number(value.slice(0, -1)))
    // ) {
    //   throw new BadRequestException([
    //     GetFieldError('Not true ID format', 'id'),
    //   ]);
    // }

    if (!Number.isInteger(Number(value))) {
      throw new NotFoundException([GetFieldError('Not true ID format', 'id')]);
    }
    if (value.length >= 8) {
      throw new BadRequestException([
        GetFieldError('Not true ID format', 'id'),
      ]);
    }
    return value;
  }
}
