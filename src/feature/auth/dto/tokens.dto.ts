export class TokensDto {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export class TokenSetting {
  readonly secret: string;
  readonly expiresIn: string;
}

export class TokensSettings {
  readonly accessToken: TokenSetting;
  readonly refreshToken: TokenSetting;
}
