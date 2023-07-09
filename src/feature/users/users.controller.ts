import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryUserDto } from './dto/query-user.dto';
import { PaginatorUserView, ViewUserDto } from './dto/view-user.dto';
import { UsersQueryRepository } from './db/users-query.repository';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BasicAuthGuard } from '../../feature/auth/guard/basic-auth.guard';
import { IdValidationPipe } from '../../modules/pipes/id-validation.pipe';
import { CommandBus } from '@nestjs/cqrs';
import { BanUnbanUserDto } from './dto/ban-unban-user.dto';
import { BanUnbanUserCommand } from './use-case/ban-unban-user.usercase';

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersService: UsersService,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getUsers(
    @Query() queryParams: QueryUserDto,
  ): Promise<PaginatorUserView> {
    return this.usersQueryRepository.getAllUsersView(queryParams);
  }

  @Post()
  async createUser(@Body() userDto: CreateUserDto): Promise<ViewUserDto> {
    const userId = await this.usersService.createUser(userDto);

    const userView = await this.usersQueryRepository.getUserViewById(userId);
    if (!userView) throw new NotFoundException('User not found');

    return userView;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', IdValidationPipe) id: string) {
    const isDeleted = await this.usersService.deleteUserById(id);
    if (!isDeleted) throw new NotFoundException('User not found');
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/ban')
  async banUnbanUser(
    @Param('id', IdValidationPipe) id: string,
    @Body() dto: BanUnbanUserDto,
  ) {
    await this.commandBus.execute(new BanUnbanUserCommand(id, dto));
  }
}
