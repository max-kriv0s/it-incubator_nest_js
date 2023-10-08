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
import {
  PaginatorUserSql,
  PaginatorUserSqlType,
  ViewUserDto,
} from './dto/view-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { BasicAuthGuard } from '../../feature/auth/guard/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { BanUnbanUserDto, QueryBanUnbanUserDto } from './dto/ban-unban-user.dto';
import { BanUnbanUserCommand } from './use-case/ban-unban-user.usercase';
import { CreateUserCommand } from './use-case/create-user.usecase';
import { UsersQuerySqlRepository } from './db/users-query.sql-repository';
import { DeleteUserCommand } from './use-case/delete-user.usecase';
import { ResultNotification } from '../../modules/notification';
import { UsersQueryRepository } from './db/users-query.repository';
import { IdIntegerValidationPipe } from '../../modules/pipes/id-integer-validation.pipe';

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersQuerySqlRepository: UsersQuerySqlRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getUsers(
    @Query() queryParams: QueryUserDto,
  ): Promise<PaginatorUserSqlType> {
    const paginator = new PaginatorUserSql(
      +queryParams.pageNumber,
      +queryParams.pageSize,
    );
    return this.usersQueryRepository.getAllUsersView(queryParams, paginator);
  }

  @Post()
  async createUser(@Body() userDto: CreateUserDto): Promise<ViewUserDto> {
    const userId: number = await this.commandBus.execute(
      new CreateUserCommand(userDto),
    );
    if (!userId) throw new BadRequestException();

    const userView = await this.usersQueryRepository.getUserViewById(userId);
    if (!userView) throw new NotFoundException('User not found');

    return userView;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', IdIntegerValidationPipe) id: string) {
    const isDeleted = await this.commandBus.execute(new DeleteUserCommand(+id));
    if (!isDeleted) throw new NotFoundException('User not found');
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/ban')
  async banUnbanUser(
    @Param('id', IdIntegerValidationPipe) id: string,
    // @Body() dto: BanUnbanUserDto,
    @Query() banQuery: QueryBanUnbanUserDto,
  ) {
    const updateResult: ResultNotification = await this.commandBus.execute(
      new BanUnbanUserCommand(+id, banQuery),
    );
    return updateResult.getResult();
  }
}
