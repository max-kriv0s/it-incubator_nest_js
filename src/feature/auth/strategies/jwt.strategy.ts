import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthConfig } from '../configuration/auth.configuration';
import { UsersService } from '../../../feature/users/users.service';

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.getTokensSettings().JWT_SECRET_ACCESS_TOKEN,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findUserById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');

    return { userId: payload.sub };
  }
}
