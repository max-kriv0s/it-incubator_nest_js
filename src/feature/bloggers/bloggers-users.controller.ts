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
import {
  ResultNotification,
  replyByNotification,
} from '../../modules/notification';
import { IdValidationPipe } from '../../modules/pipes/id-validation.pipe';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { AccessJwtAuthGuard } from '../auth/guard/jwt.guard';
import { BloggerQueryRepository } from './db/blogger-query.repository';
import { BloggerBanUserInputDto } from './dto/blogger-ban-user-input.dto';
import { BloggerBannedUsersQueryParams } from './dto/blogger-banned-users-query-param.dto';
import { PaginatorViewBloggerBannedUsersDto } from './dto/view-blogger-banned-users.dto';
import { BloggerBanUnbanUserCommand } from './use-case/blogger-ban-unban-user.usecase';

@UseGuards(AccessJwtAuthGuard)
@Controller('blogger/users')
export class BloggersUsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly bloggerQueryRepository: BloggerQueryRepository,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/ban')
  async BanUnbanUser(
    @CurrentUserId() userId: string,
    @Param('id', IdValidationPipe) bannedUserId: string,
    @Body() banUserInputDto: BloggerBanUserInputDto,
  ) {
    const result: ResultNotification<null> = await this.commandBus.execute(
      new BloggerBanUnbanUserCommand(userId, bannedUserId, banUserInputDto),
    );

    if (result.hasError()) {
      replyByNotification(result);
      // const error = result.getError();
      // throw new BadRequestException([
      //   GetFieldError(error.message, error.field),
      // ]);
    }
    return;
  }

  @Get('blog/:id')
  async getAllBannedUsersForBlog(
    @Param('id', IdValidationPipe) id: string,
    @Query() queryParam: BloggerBannedUsersQueryParams,
    @CurrentUserId() userId: string,
  ): Promise<PaginatorViewBloggerBannedUsersDto> {
    const result = await this.bloggerQueryRepository.getAllBannedUsersForBlog(
      id,
      userId,
      queryParam,
    );
    return replyByNotification<PaginatorViewBloggerBannedUsersDto>(result);
  }
}
