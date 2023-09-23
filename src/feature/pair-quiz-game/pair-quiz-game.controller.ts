import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessJwtAuthGuard } from '../auth/guard/jwt.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.param.decorator';
import { CommandBus } from '@nestjs/cqrs';
import {
  PaginatorPairQuizGame,
  PairQuizGameViewDto,
} from './dto/pair-quiz-game-view.dto';
import { PairQuizGameQueryRepository } from './db/pair-quiz-game-query.repository';
import { CreatePairQuizGameCommand } from './use-case/create-pair-quiz-game.usecase';
import { ResultNotification } from '../../modules/notification';
import { AnswerDto } from './dto/answer.dto';
import { AnswerPairQuizGameCommand } from './use-case/answer-pair-quiz-game.usecase';
import { PairQuizGameProgressViewDto } from './dto/pair-quiz-game-progress-view.dto';
import { PairQuizGameProgressQueryRepository } from './db/pair-quiz-game-progress-query.repository';
import { IdIntegerValidationPipeTest } from '../../modules/pipes/id-integer-validation.pipe-test.pipe';
import { PairQuizGameQueryParams } from '../bloggers/dto/pair-quiz-game-query-params.dto';

@Controller('pair-game-quiz/pairs')
@UseGuards(AccessJwtAuthGuard)
export class PairQuizGameController {
  constructor(
    private commandBus: CommandBus,
    private readonly pairQuizGameQueryRepository: PairQuizGameQueryRepository,
    private readonly pairQuizGameProgressQueryRepository: PairQuizGameProgressQueryRepository,
  ) {}

  @Post('connection')
  @HttpCode(HttpStatus.OK)
  async connectionGame(
    @CurrentUserId() userId: string,
  ): Promise<PairQuizGameViewDto> {
    const gameId: number | null = await this.commandBus.execute(
      new CreatePairQuizGameCommand(+userId),
    );
    if (!gameId) {
      throw new ForbiddenException();
    }

    const result: ResultNotification<PairQuizGameViewDto> =
      await this.pairQuizGameQueryRepository.findGameById(gameId, +userId);

    const infoGameView = result.getResult();
    if (!infoGameView) throw new NotFoundException('Game not found');
    return infoGameView;
  }

  @Get('my-current')
  async myCurrentGame(
    @CurrentUserId() userId: string,
  ): Promise<PairQuizGameViewDto> {
    const gameView = await this.pairQuizGameQueryRepository.myCurrentGame(
      +userId,
    );
    if (!gameView) throw new NotFoundException('No active game');
    return gameView;
  }

  @Get('my')
  async getAllMyGames(
    @Query() queryParams: PairQuizGameQueryParams,
    @CurrentUserId() userId: string,
  ) {
    const paginator = new PaginatorPairQuizGame(
      +queryParams.pageNumber,
      +queryParams.pageSize,
    );
    return this.pairQuizGameQueryRepository.getAllMyGames(
      queryParams,
      +userId,
      paginator,
    );
  }

  @Get(':id')
  async findGameById(
    @Param('id', IdIntegerValidationPipeTest) id: string,
    @CurrentUserId() userId: string,
  ): Promise<PairQuizGameViewDto> {
    const result: ResultNotification<PairQuizGameViewDto> =
      await this.pairQuizGameQueryRepository.findGameById(+id, +userId);

    const infoGameView = result.getResult();
    if (!infoGameView) throw new NotFoundException('Game not found');
    return infoGameView;
  }

  @Post('my-current/answers')
  @HttpCode(HttpStatus.OK)
  async myCurrentAnswers(
    @CurrentUserId() userId: string,
    @Body() answerDto: AnswerDto,
  ): Promise<PairQuizGameProgressViewDto> {
    const questionId: number = await this.commandBus.execute(
      new AnswerPairQuizGameCommand(answerDto.answer, +userId),
    );

    if (!questionId) throw new ForbiddenException();
    const questionView =
      await this.pairQuizGameProgressQueryRepository.findQuestionById(
        questionId,
      );
    if (!questionView) throw new NotFoundException();
    return questionView;
  }
}
