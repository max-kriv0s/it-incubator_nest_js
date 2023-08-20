import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ViewSecurityDeviceDto } from './dto/view-security-device.dto';
import { CurrentUser } from '../auth/decorators/current-user-id-device.decorator';
import { RefreshJwtAuthGuard } from '../auth/guard/jwt-refresh.guard';
import { refreshTokenDto } from '../auth/dto/refresh-token.dto';
import { SecurityDevicesService } from './security-devices.service';
import { SecurityDevicesQueryRepository } from './db/security-devices -query.repository';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly securityDevicesService: SecurityDevicesService,
    private readonly securityDevicesQueryRepository: SecurityDevicesQueryRepository
  ) {}

  @UseGuards(RefreshJwtAuthGuard)
  @Get()
  async getSecurityDevices(
    @CurrentUser() tokenDto: refreshTokenDto,
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
  async deleteSecurityDevices(@CurrentUser() tokenDto: refreshTokenDto) {
    await this.securityDevicesService.deleteAllDevicesSessionsByUserID(
      +tokenDto.userId,
      +tokenDto.deviceId,
    );
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSecurityDeviceByID(
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @CurrentUser() tokenDto: refreshTokenDto,
  ) {
    const deleteResult =
      await this.securityDevicesService.deleteUserSessionByDeviceID(
        deviceId,
        +tokenDto.userId,
      );

    return deleteResult.getResult();
  }
}
