import { Injectable } from '@nestjs/common';
import {
  ValidationOptions,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { BlogsService } from 'src/feature/blogs/blogs.service';

@Injectable()
export class BlogExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly blogsService: BlogsService) {}

  async validate(value: string) {
    const blogId = await this.blogsService.findBlogById(value);
    return blogId ? true : false;
  }

  defaultMessage() {
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
