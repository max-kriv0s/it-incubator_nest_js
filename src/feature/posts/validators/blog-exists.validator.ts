import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { BlogsSqlRepository } from '../../../feature/blogs/db/blogs.sql-repository';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistsRule implements ValidatorConstraintInterface {
  constructor(private blogsSqlRepository: BlogsSqlRepository) {}

  async validate(value: string, args: ValidationArguments) {
    const blogId = await this.blogsSqlRepository.findBlogById(value);
    return blogId ? true : false;
  }

  defaultMessage(args: ValidationArguments) {
    return "Blog doesn't exist";
  }
}

export function BlogExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'BlogExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: BlogExistsRule,
    });
  };
}
