import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();

    if (process.env.envoriment !== 'production') {
      response
        .status(500)
        .send({ error: exception.message, stack: exception.stack }); // error: exception.toString()
    } else {
      response.status(500).send('some error ocurred');
    }
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 500 && process.env.envoriment !== 'production') {
      response.status(status).json(exception);
    }

    if (status === 400) {
      const errorsMessages: any = [];
      const responseBody: any = exception.getResponse();
      responseBody.message.forEach((m) => errorsMessages.push(m));

      response.status(status).json({
        errorsMessages,
      });
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
