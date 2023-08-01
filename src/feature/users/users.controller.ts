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
import { BanUnbanUserDto } from './dto/ban-unban-user.dto';
import { BanUnbanUserCommand } from './use-case/ban-unban-user.usercase';
import { CreateUserCommand } from './use-case/create-user.usecase';
import { UsersQuerySqlRepository } from './db/users-query.sql-repository';
import { DeleteUserCommand } from './use-case/delete-user.usecase';
import { IdIntegerValidationPipe } from '../../modules/pipes/id-integer-validation.pipe';

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersQuerySqlRepository: UsersQuerySqlRepository,
  ) {}

  @Get()
  async getUsers(
    @Query() queryParams: QueryUserDto,
  ): Promise<PaginatorUserSqlType> {
    const paginator = new PaginatorUserSql(
      +queryParams.pageNumber,
      +queryParams.pageSize,
    );
    return this.usersQuerySqlRepository.getAllUsersView(queryParams, paginator);
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
  async deleteUser(@Param('id', IdIntegerValidationPipe) id: string) {
    const isDeleted = await this.commandBus.execute(new DeleteUserCommand(+id));
    if (!isDeleted) throw new NotFoundException('User not found');
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/ban')
  async banUnbanUser(
    @Param('id', IdIntegerValidationPipe) id: string,
    @Body() dto: BanUnbanUserDto,
  ) {
    const updateResult = await this.commandBus.execute(
      new BanUnbanUserCommand(+id, dto),
    );
    return updateResult.getResult();
  }
}
