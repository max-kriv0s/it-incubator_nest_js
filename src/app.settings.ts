import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import { HttpExceptionFilter } from './exceptions/exception.filter';

export const appSettings = (app: INestApplication) => {
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsForResponse: any[] = [];
        errors.forEach((err) => {
          if (err.constraints) {
            const constraintsKeys = Object.keys(err.constraints);
            constraintsKeys.forEach((key) => {
              errorsForResponse.push({
                message: err.constraints![key],
                field: err.property,
              });
            });
          }
        });
        throw new BadRequestException(errorsForResponse);
      },
    }),
  );

  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
};
