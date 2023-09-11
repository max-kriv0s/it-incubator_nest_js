import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { GetFieldError } from '../../utils';

@Injectable()
export class IdIntegerValidationPipeBadRequest implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param') {
      return value;
    }

    if (!Number.isInteger(Number(value))) {
      throw new BadRequestException([
        GetFieldError('Not true ID format', 'id'),
      ]);
    }
    return value;
  }
}
