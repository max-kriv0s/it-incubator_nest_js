import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { QueryUserDto } from './dto/query-user.dto';
import { PaginatorUserView, ViewUserDto } from './dto/view-user.dto';
import { UsersQueryRepository } from './users-query.repository';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { calcResultDto } from '../utils';
import { ParamsDto } from 'src/dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async getUsers(
    @Query() queryParams: QueryUserDto,
  ): Promise<PaginatorUserView> {
    return this.usersQueryRepository.getAllUsersView(queryParams);
  }

  @Post()
  async createUser(@Body() userDto: CreateUserDto): Promise<ViewUserDto> {
    const createdUser = await this.usersService.createUser(userDto);

    const result = await this.usersQueryRepository.getUserViewById(
      createdUser._id,
    );
    return calcResultDto<ViewUserDto>(
      result.code,
      result.data as ViewUserDto,
      result.errorMessage,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteUser(@Param() param: ParamsDto) {
  async deleteUser(@Param('id') id: string) {
    const deletedUser = await this.usersService.deleteUserById(id);
    if (!deletedUser)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return;
  }
}
