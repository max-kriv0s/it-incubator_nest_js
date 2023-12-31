import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (checkUserId = true, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();

    if (checkUserId && !request.user?.userId)
      throw new Error('JwtGuard must be used');
    return request.user?.userId as string;
  },
);
