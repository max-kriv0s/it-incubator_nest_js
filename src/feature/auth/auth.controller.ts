import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginInputDto } from './dto/login-input.dto';
import { LoginSuccessViewDto } from './dto/login-success-view.dto';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ViewMeDto } from './dto/view-me.dto';
import { CurrentUserId } from './decorators/current-user-id.param.decorator';
import { UsersQueryRepository } from '../users/users-query.repository';
import { AccessJwtAuthGuard } from './guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() { loginOrEmail, password }: LoginInputDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginSuccessViewDto> {
    const tokens = await this.authService.login(
      loginOrEmail,
      password,
      userAgent,
      ip,
    );

    if (!tokens)
      throw new UnauthorizedException('If the password or login is wrong');

    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('me')
  async getMeView(@CurrentUserId() userId: string): Promise<ViewMeDto> {
    const user = await this.usersQueryRepository.getMeView(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}
