import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessJwtAuthGuard } from '../../../feature/auth/guard/jwt.guard';
import { CurrentUserId } from 'src/feature/auth/decorators/current-user-id.param.decorator';
import { CommandBus } from '@nestjs/cqrs';
import {
  TelegramAdapter,
  TelegramUpdateMessage,
} from '../../../adapters/telegram.adapter';
import { GenerateAuthBotLinkCommand } from './use-case/generate-auth-bot-link.usecase';
import { TelegramAuthLinkView } from './dto/telegram-auth-link-view.dto';
import { UpdatingMessagesFromTelegramCommand } from './use-case/updating-messages-from-telegram.usecase';

@Controller('integrations/telegram')
export class TelegramUserAccountsController {
  private readonly logger = new Logger('telegram');
  constructor(
    private readonly commandBus: CommandBus,
    private readonly telegramAdapter: TelegramAdapter,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setWebhook() {
    this.telegramAdapter.setWebhook();
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('auth-bot-link')
  async generateAuthBotLink(
    @CurrentUserId() userId: string,
  ): Promise<TelegramAuthLinkView> {
    this.logger.log('generateAuthBotLink');
    return this.commandBus.execute(new GenerateAuthBotLinkCommand(+userId));
  }

  @Post('update-messages')
  async updatingMessagesFromTelegram(@Body() payload: TelegramUpdateMessage) {
    this.commandBus.execute(new UpdatingMessagesFromTelegramCommand(payload));
  }
}
