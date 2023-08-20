import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TokensDto } from './dto/tokens.dto';
import { AuthConfig } from './configuration/auth.configuration';
import { SecurityDevicesService } from '../security-devices/security-devices.service';
import { TokenDataDto } from './dto/token-data.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authConfig: AuthConfig,
    private readonly usersService: UsersService,
    private readonly securityDevicesService: SecurityDevicesService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    loginOrEmail: string,
    password: string,
    userAgent: string,
    ip: string,
  ): Promise<TokensDto | null> {
    const userId = await this.usersService.checkCredentials(
      loginOrEmail,
      password,
    );
    if (!userId) return null;

    const securityDevicesId =
      await this.securityDevicesService.CreateSecurityDevice(
        userId,
        ip,
        userAgent,
      );
    if (!securityDevicesId) return null;

    const tokens = await this.createTokens(userId, securityDevicesId);
    const dataRefreshTokenDto = await this.getDataRefreshTokenDto(
      tokens.refreshToken,
    );

    await this.securityDevicesService.updateSecurityDeviceSession(
      dataRefreshTokenDto,
      ip,
      userAgent,
    );

    return tokens;
  }

  async createTokens(
    userId: number,
    securityDevicesId: number,
  ): Promise<TokensDto> {
    const settings = this.authConfig.getTokensSettings();

    const accessToken = await this.jwtService.signAsync(
      { sub: userId.toString() },
      {
        secret: settings.JWT_SECRET_ACCESS_TOKEN,
        expiresIn: settings.JWT_ACCESS_TOKEN_EXPIRES_IN,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId.toString(),
        deviceId: securityDevicesId.toString(),
      },
      {
        secret: settings.JWT_SECRET_REFRESH_TOKEN,
        expiresIn: settings.JWT_REFRESH_TOKEN_EXPIRES_IN,
      },
    );

    const tokens = {
      accessToken,
      refreshToken,
    };

    return tokens;
  }

  async getDataRefreshTokenDto(refreshToken: string): Promise<TokenDataDto> {
    const settings = this.authConfig.getTokensSettings();

    const result = await this.jwtService.verifyAsync(refreshToken, {
      secret: settings.JWT_SECRET_REFRESH_TOKEN,
    });

    return {
      userId: result.sub,
      deviceId: result.deviceId,
      issuedAd: new Date(result.iat * 1000),
      expirationTime: new Date(result.exp * 1000),
    };
  }

  async updateUserRefreshToken(
    userId: number,
    deviceId: number,
    ip: string,
    userAgent: string,
  ): Promise<TokensDto | null> {
    const user = await this.usersService.findUserById(userId);
    if (!user) return null;

    const tokens = await this.createTokens(userId, deviceId);

    const dataRefreshTokenDto = await this.getDataRefreshTokenDto(
      tokens.refreshToken,
    );

    const isUpdateSecurityDevice =
      await this.securityDevicesService.updateSecurityDeviceSession(
        dataRefreshTokenDto,
        ip,
        userAgent,
      );
    if (!isUpdateSecurityDevice) return null;

    return tokens;
  }

  async logoutUserSessionByDeviceID(deviceId: number, userId: number) {
    return this.securityDevicesService.logoutUserSessionByDeviceID(
      deviceId,
      userId,
    );
  }
}
