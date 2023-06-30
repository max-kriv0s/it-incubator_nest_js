import { ExecutionContext, createParamDecorator } from '@nestjs/common';

// посмотреть как передать в декаратор параметр
export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();

    if (!request.user?.userId) throw new Error('JwtGuard must be used');
    return request.user?.userId as string;
  },
);
