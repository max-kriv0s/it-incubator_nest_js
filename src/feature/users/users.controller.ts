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
import { BasicAuthGuard } from '../../feature/auth/guard/basic-auth.guard';
import { IdValidationPipe } from '../../modules/pipes/id-validation.pipe';
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
  async deleteUser(@Param('id', IdValidationPipe) id: string) {
    const isDeleted = await this.usersService.deleteUserById(id);
    if (!isDeleted) throw new NotFoundException('User not found');
    return;
  }
}
