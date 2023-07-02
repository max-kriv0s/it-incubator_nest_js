import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { BlogsService } from '../../../feature/blogs/blogs.service';
import { BlogsRepository } from 'src/feature/blogs/blogs.repository';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistsRule implements ValidatorConstraintInterface {
  constructor(
    private blogsService: BlogsService,
    private blogsRepository: BlogsRepository,
  ) {}

  async validate(value: string, args: ValidationArguments) {
    const blogId = await this.blogsService.findBlogById(value);
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
