import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth/guard/basic-auth.guard';
import { IdValidationPipe } from '../../modules/pipes/id-validation.pipe';
import { BindBlogWithUserCommand } from './use-case/bind-blog-with-user.usecase';
import { GetFieldError } from '../../utils';
import { CommandBus } from '@nestjs/cqrs';
import { QueryParamsAllBlogs } from './dto/query-all-blogs.dto';
import { UsersBlogsQueryRepository } from './db/users-blogs-query.repository';
import { UserBanBlogInputDto } from './dto/user-ban-blog-input.dto';
import { UserBanUnbanBlogCommand } from './use-case/user-ban-unban-blog.usecase';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class UsersBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersBlogsQueryRepository: UsersBlogsQueryRepository,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/ban')
  async banUnbanBlog(
    @Param('id', IdValidationPipe) blogId: string,
    @Body() inputDto: UserBanBlogInputDto,
  ) {
    const result = await this.commandBus.execute(
      new UserBanUnbanBlogCommand(blogId, inputDto),
    );

    if (!result)
      throw new BadRequestException(GetFieldError('Blog not found', 'id'));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/bind-with-user/:userId')
  async bindBlogWithUser(
    @Param('id', IdValidationPipe) blogId: string,
    @Param('userId', IdValidationPipe) userId: string,
  ) {
    const result = await this.commandBus.execute(
      new BindBlogWithUserCommand(blogId, userId),
    );
    if (result.hasError()) {
      const error = result.getError();
      throw new BadRequestException(GetFieldError(error.message, error.field));
    }
  }

  @Get()
  async getAllUsersBlogs(@Query() queryParams: QueryParamsAllBlogs) {
    return this.usersBlogsQueryRepository.getAllUsersBlogs(queryParams);
  }
}
