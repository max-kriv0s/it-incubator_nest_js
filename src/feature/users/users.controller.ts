import {
  BadRequestException,
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
import { CommandBus } from '@nestjs/cqrs';
import { BanUnbanUserDto } from './dto/ban-unban-user.dto';
import { BanUnbanUserCommand } from './use-case/ban-unban-user.usercase';
import { CreateUserCommand } from './use-case/create-user.usecase';
import { UsersQuerySqlRepository } from './db/users-query.sql-repository';
import { DeleteUserCommand } from './use-case/delete-user.usecase';
import { replyByNotification } from 'src/modules/notification';

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersService: UsersService,
    private commandBus: CommandBus,
    private readonly usersQuerySqlRepository: UsersQuerySqlRepository,
  ) {}

  @Get()
  async getUsers(
    @Query() queryParams: QueryUserDto,
  ): Promise<PaginatorUserView> {
    return this.usersQuerySqlRepository.getAllUsersView(queryParams);
  }

  @Post()
  async createUser(@Body() userDto: CreateUserDto): Promise<ViewUserDto> {
    const userId = await this.commandBus.execute(
      new CreateUserCommand(userDto),
    );
    if (!userId) throw new BadRequestException();

    const userView = await this.usersQuerySqlRepository.getUserViewById(userId);
    if (!userView) throw new NotFoundException('User not found');

    return userView;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    const isDeleted = await this.commandBus.execute(new DeleteUserCommand(id));
    if (!isDeleted) throw new NotFoundException('User not found');
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/ban')
  async banUnbanUser(@Param('id') id: string, @Body() dto: BanUnbanUserDto) {
    const result = await this.commandBus.execute(
      new BanUnbanUserCommand(id, dto),
    );
    return replyByNotification(result);
  }
}
