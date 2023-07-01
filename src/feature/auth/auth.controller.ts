import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  NotFoundException,
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
import { RegistrationEmailResendingDto } from './dto/registration-email-resending.dto';
import { UsersService } from '../users/users.service';
import { NewPasswordRecoveryInputDto } from './dto/new-password-recovery-inputdto';
import { RefreshJwtAuthGuard } from './guard/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user-id-device.decorator';
import { refreshTokenDto } from './dto/refresh-token.dto';
import { RegistrationConfirmationCodeDto } from './dto/registration-confirmation-code.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersService: UsersService,
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
  async getMeView(@CurrentUserId(false) userId: string): Promise<ViewMeDto> {
    const user = await this.usersQueryRepository.getMeView(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() emailDto: RegistrationEmailResendingDto) {
    const isDone = await this.usersService.passwordRecovery(emailDto.email);
    if (!isDone) throw new NotFoundException('User not found');
    return;
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() newPasswordDto: NewPasswordRecoveryInputDto) {
    const isUpdate = await this.usersService.newPassword(
      newPasswordDto.newPassword,
      newPasswordDto.recoveryCode,
    );
    if (!isUpdate) throw new NotFoundException('User not found');
    return;
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async updateUserRefreshToken(
    @CurrentUser() currentUser: refreshTokenDto,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginSuccessViewDto> {
    if (!currentUser.userId || !currentUser.deviceId)
      throw new UnauthorizedException();

    const tokens = await this.authService.updateUserRefreshToken(
      currentUser.userId,
      currentUser.deviceId,
      ip,
      userAgent,
    );
    if (!tokens) throw new UnauthorizedException();

    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokens.accessToken };
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(
    @Body() confirmDto: RegistrationConfirmationCodeDto,
  ) {
    const error = await this.usersService.confirmRegistration(confirmDto.code);
    if (error)
      throw new BadRequestException([
        { message: 'User update error', field: 'code' },
      ]);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async createUserForEmailConfirmation(@Body() userDto: CreateUserDto) {
    const error = await this.usersService.createUserForEmailConfirmation(
      userDto,
    );
    if (error) throw new BadRequestException(error);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendingConfirmationCodeToUser(
    @Body() emailDto: RegistrationEmailResendingDto,
  ) {
    const error = await this.usersService.resendingConfirmationCodeToUser(
      emailDto.email,
    );
    if (error) throw new BadRequestException(error);
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutUserSessionByDeviceID(
    @CurrentUser() currentUser: refreshTokenDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!currentUser.userId || !currentUser.deviceId)
      throw new UnauthorizedException();

    const isDeleted = this.authService.logoutUserSessionByDeviceID(
      currentUser.deviceId,
      currentUser.userId,
    );
    if (!isDeleted) throw new UnauthorizedException();
    response.clearCookie('refreshToken');
    return true;
  }
}
