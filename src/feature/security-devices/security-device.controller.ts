import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ViewSecurityDeviceDto } from './dto/view-security-device.dto';
import { CurrentUser } from '../auth/decorators/current-user-id-device.decorator';
import { RefreshJwtAuthGuard } from '../auth/guard/jwt-refresh.guard';
import { refreshTokenDto } from '../auth/dto/refresh-token.dto';
import { SecurityDevicesService } from './security-devices.service';
import { SecurityDevicesQuerySqlRepository } from './db/security-devices -query.sql-repository';
import { IdIntegerValidationPipe } from '../../modules/pipes/id-integer-validation.pipe';
import { ResultNotification } from '../../modules/notification';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly securityDevicesService: SecurityDevicesService,
    private readonly securityDevicesQuerySqlRepository: SecurityDevicesQuerySqlRepository,
  ) {}

  @UseGuards(RefreshJwtAuthGuard)
  @Get()
  async getSecurityDevices(
    @CurrentUser() tokenDto: refreshTokenDto,
  ): Promise<ViewSecurityDeviceDto[]> {
    const devices =
      await this.securityDevicesQuerySqlRepository.getAllDevicesSessionsByUserID(
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
      tokenDto.userId,
      tokenDto.deviceId,
    );
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSecurityDeviceByID(
    @Param('deviceId', IdIntegerValidationPipe) deviceId: string,
    @CurrentUser() tokenDto: refreshTokenDto,
  ) {
    const deleteResult = new ResultNotification<null>();
    await this.securityDevicesService.deleteUserSessionByDeviceID(
      +deviceId,
      tokenDto.userId,
      deleteResult,
    );

    return deleteResult.getResult();
  }
}
