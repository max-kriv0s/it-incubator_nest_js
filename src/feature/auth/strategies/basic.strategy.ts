import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { AuthConfig } from '../configuration/auth.configuration';

@Injectable()
export class BasicStategy extends PassportStrategy(Strategy) {
  constructor(private readonly authConfig: AuthConfig) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const basicAuth = this.authConfig.getBasicAuthParam();
    if (username === basicAuth.username && password === basicAuth.password) {
      return true;
    }

    throw new UnauthorizedException();
  }
}
