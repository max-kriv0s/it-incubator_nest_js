import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ViewSecurityDeviceDto } from './dto/view-security-device.dto';
import { CurrentUserIdDeviceId } from '../auth/decorators/current-user-id-device.decorator';
import { RefreshJwtAuthGuard } from '../auth/guard/jwt-refresh.guard';
import { SecurityDevicesQueryRepository } from './security-devices -query.repository';
import { refreshTokenDto } from '../auth/dto/refresh-token.dto';
import { SecurityDevicesService } from './security-devices.service';
import { ParamDeviceIdDto } from 'src/dto';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly securityDevicesService: SecurityDevicesService,
    private readonly securityDevicesQueryRepository: SecurityDevicesQueryRepository,
  ) {}

  @UseGuards(RefreshJwtAuthGuard)
  @Get()
  async getSecurityDevices(
    @CurrentUserIdDeviceId() tokenDto: refreshTokenDto,
  ): Promise<ViewSecurityDeviceDto[]> {
    const devices =
      await this.securityDevicesQueryRepository.getAllDevicesSessionsByUserID(
        tokenDto.userId,
      );
    if (!devices) throw new UnauthorizedException('User not found');
    return devices;
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSecurityDevices(
    @CurrentUserIdDeviceId() tokenDto: refreshTokenDto,
  ) {
    const isDeleted =
      await this.securityDevicesService.deleteAllDevicesSessionsByUserID(
        tokenDto.userId,
        tokenDto.deviceId,
      );
    if (!isDeleted) throw new UnauthorizedException();

    return;
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSecurityDeviceByID(
    @Param() params: ParamDeviceIdDto,
    @CurrentUserIdDeviceId() tokenDto: refreshTokenDto,
  ) {
    const result =
      await this.securityDevicesService.deleteUserSessionByDeviceID(
        params.deviceId,
        tokenDto.userId,
      );

    if (!result.securityDeviceExists || !result.securityDeviceDeleted)
      throw new NotFoundException();
    if (!result.isUserSecurityDevice) throw new ForbiddenException();

    return;
  }
}
