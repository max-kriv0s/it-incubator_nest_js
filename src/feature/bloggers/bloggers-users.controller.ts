import {
  UseGuards,
  Controller,
  HttpCode,
  HttpStatus,
  Put,
  Param,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ResultNotification } from '../../modules/notification';
import { IdValidationPipe } from '../../modules/pipes/id-validation.pipe';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { AccessJwtAuthGuard } from '../auth/guard/jwt.guard';
import { BloggerBanUserInputDto } from './dto/blogger-ban-user-input.dto';
import { BloggerBannedUsersQueryParams } from './dto/blogger-banned-users-query-param.dto';
import {
  PaginatorViewBloggerBannedUsersSql,
  PaginatorViewBloggerBannedUsersSqlType,
} from './dto/view-blogger-banned-users.dto';
import { BloggerBanUnbanUserCommand } from './use-case/blogger-ban-unban-user.usecase';
import { IdIntegerValidationPipe } from '../../modules/pipes/id-integer-validation.pipe';
import { BloggerQuerySqlRepository } from './db/blogger-query.sql-repository';

@UseGuards(AccessJwtAuthGuard)
@Controller('blogger/users')
export class BloggersUsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly bloggerQuerySqlRepository: BloggerQuerySqlRepository,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/ban')
  async BanUnbanUser(
    @CurrentUserId() userId: string,
    @Param('id', IdIntegerValidationPipe) bannedUserId: string,
    @Body() banUserInputDto: BloggerBanUserInputDto,
  ) {
    const result: ResultNotification<null> = await this.commandBus.execute(
      new BloggerBanUnbanUserCommand(userId, bannedUserId, banUserInputDto),
    );
    return result.getResult();
  }

  @Get('blog/:id')
  async getAllBannedUsersForBlog(
    @Param('id', IdIntegerValidationPipe) id: string,
    @Query() queryParams: BloggerBannedUsersQueryParams,
    @CurrentUserId() userId: string,
  ): Promise<PaginatorViewBloggerBannedUsersSqlType> {
    const paginator = new PaginatorViewBloggerBannedUsersSql(
      +queryParams.pageNumber,
      +queryParams.pageSize,
    );
    const result: ResultNotification<PaginatorViewBloggerBannedUsersSqlType> =
      await this.bloggerQuerySqlRepository.getAllBannedUsersForBlog(
        id,
        userId,
        queryParams,
        paginator,
      );

    const paginateView = result.getResult();
    return paginateView!;
  }
}
