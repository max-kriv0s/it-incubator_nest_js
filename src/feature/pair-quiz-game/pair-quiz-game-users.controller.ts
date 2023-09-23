import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AccessJwtAuthGuard } from '../auth/guard/jwt.guard';
import {
  PaginatorPairQuizGameUsersTop,
  PaginatorPairQuizGameUsersTopViewType,
  PairQuizGameStatisticViewDto,
} from './dto/pair-quiz-game-statistic-view.dto';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { PairQuizGameProgressQueryRepository } from './db/pair-quiz-game-progress-query.repository';
import { PairQuizGameUsersTopQueryParams } from './dto/pair-quiz-game-query-params.dto';

@Controller('pair-game-quiz/users')
export class PairQuizGameUsersController {
  constructor(
    private readonly pairQuizGameProgressQueryRepository: PairQuizGameProgressQueryRepository,
  ) {}

  @UseGuards(AccessJwtAuthGuard)
  @Get('my-statistic')
  async userGameStatistics(
    @CurrentUserId() userId: string,
  ): Promise<PairQuizGameStatisticViewDto> {
    return this.pairQuizGameProgressQueryRepository.userGameStatistics(+userId);
  }

  @Get('top')
  async getUsersTop(
    @Query() queryParams: PairQuizGameUsersTopQueryParams,
  ): Promise<PaginatorPairQuizGameUsersTopViewType> {
    const paginator = new PaginatorPairQuizGameUsersTop(
      +queryParams.pageNumber,
      +queryParams.pageSize,
    );
    return this.pairQuizGameProgressQueryRepository.getUsersTop(
      queryParams,
      paginator,
    );
  }
}
