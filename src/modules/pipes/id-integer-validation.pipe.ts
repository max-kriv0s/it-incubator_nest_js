import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { GetFieldError } from '../../utils';

@Injectable()
export class IdIntegerValidationPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param') {
      return value;
    }

    if (!Number.isInteger(Number(value))) {
      throw new NotFoundException([GetFieldError('Not true ID format', 'id')]);
    }
    return value;
  }
}
