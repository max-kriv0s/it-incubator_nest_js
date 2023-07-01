import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthConfig } from '../configuration/auth.configuration';

@Injectable()
export class OptionalJwtRefreshTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService, private authConfig: AuthConfig) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);
    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.authConfig.getTokensSettings().JWT_SECRET_REFRESH_TOKEN,
        });

        request['user'] = { userId: payload.sub, deviceId: payload.deviceId };
      } catch {}
    }
    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    const token = request.cookies?.refreshToken;
    return token;
  }
}
