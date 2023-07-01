import { Injectable, NestMiddleware } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response, NextFunction } from 'express';
import { ApiCallsService } from '../feature/api-calls/api-calls.service';

@Injectable()
export class ApiCallsMiddleware implements NestMiddleware {
  constructor(private readonly apiCallsService: ApiCallsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const result = await this.apiCallsService.addСallRecord(
      req.ip,
      req.originalUrl,
    );
    if (!result) throw new ThrottlerException();

    const requestAllowed = await this.apiCallsService.requestAllowed(
      req.ip,
      req.originalUrl,
    );
    if (!requestAllowed) throw new ThrottlerException();
    next();
  }
}
