import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthConfig } from '../configuration/auth.configuration';

@Injectable()
export class OptionalJwtTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService, private authConfig: AuthConfig) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.authConfig.getTokensSettings().JWT_SECRET_ACCESS_TOKEN,
        });

        request['user'] = { userId: payload.sub };
      } catch {}
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
