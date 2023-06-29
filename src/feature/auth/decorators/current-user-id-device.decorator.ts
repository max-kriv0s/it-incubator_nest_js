import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { refreshTokenDto } from '../dto/refresh-token.dto';

export const CurrentUserIdDeviceId = createParamDecorator(
  (data: unknown, context: ExecutionContext): refreshTokenDto => {
    const request = context.switchToHttp().getRequest();

    if (!request.user) throw new Error('JwtGuard must be used');
    return request.user as refreshTokenDto;
  },
);
