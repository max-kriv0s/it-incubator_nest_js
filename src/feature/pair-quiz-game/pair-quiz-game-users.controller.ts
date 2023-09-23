import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccessJwtAuthGuard } from '../auth/guard/jwt.guard';
import { PairQuizGameStatisticViewDto } from './dto/pair-quiz-game-statistic-view.dto';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { PairQuizGameProgressQueryRepository } from './db/pair-quiz-game-progress-query.repository';

@Controller('pair-game-quiz/users')
@UseGuards(AccessJwtAuthGuard)
export class PairQuizGameUsersController {
  constructor(
    private readonly pairQuizGameProgressQueryRepository: PairQuizGameProgressQueryRepository,
  ) {}

  @Get('users/my-statistic')
  async userGameStatistics(
    @CurrentUserId() userId: string,
  ): Promise<PairQuizGameStatisticViewDto> {
    return this.pairQuizGameProgressQueryRepository.userGameStatistics(+userId);
  }
}
