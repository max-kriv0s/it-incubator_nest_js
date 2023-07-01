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
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryUserDto } from './dto/query-user.dto';
import { PaginatorUserView, ViewUserDto } from './dto/view-user.dto';
import { UsersQueryRepository } from './users-query.repository';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ParamIdDto } from 'src/dto';
import { BasicAuthGuard } from 'src/feature/auth/guard/basic-auth.guard';
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getUsers(
    @Query() queryParams: QueryUserDto,
  ): Promise<PaginatorUserView> {
    return this.usersQueryRepository.getAllUsersView(queryParams);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(@Body() userDto: CreateUserDto): Promise<ViewUserDto> {
    const userId = await this.usersService.createUser(userDto);

    const userView = await this.usersQueryRepository.getUserViewById(userId);
    if (!userView) throw new NotFoundException('User not found');

    return userView;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param() params: ParamIdDto) {
    const isDeleted = await this.usersService.deleteUserById(params.id);
    if (!isDeleted) throw new NotFoundException('User not found');
    return;
  }
}
