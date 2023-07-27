import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthConfig } from '../configuration/auth.configuration';
import { UsersService } from '../../../feature/users/users.service';
import { Request } from 'express';
import { SecurityDevicesService } from '../../../feature/security-devices/security-devices.service';
import { TokenDataDto } from '../dto/token-data.dto';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly usersService: UsersService,
    private readonly securityDevicesService: SecurityDevicesService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshJwtStrategy.extractJWT,
      ]),
      ignoreExpiration: false,
      secretOrKey: authConfig.getTokensSettings().JWT_SECRET_REFRESH_TOKEN,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findUserSqlById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');

    if (!payload.sub || !payload.deviceId)
      throw new UnauthorizedException('User not found');

    const dataRefreshTokenDto: TokenDataDto = {
      userId: payload.sub,
      deviceId: payload.deviceId,
      issuedAd: new Date(payload.iat * 1000),
      expirationTime: new Date(payload.exp * 1000),
    };

    const isVerify =
      await this.securityDevicesService.verifySecurityDeviceByToken(
        dataRefreshTokenDto,
      );
    if (!isVerify) throw new UnauthorizedException();

    return { userId: payload.sub, deviceId: payload.deviceId };
  }

  private static extractJWT(req: Request): string | null {
    if (
      req.cookies &&
      'refreshToken' in req.cookies &&
      req.cookies.refreshToken.length > 0
    ) {
      return req.cookies.refreshToken;
    }
    return null;
  }
}
