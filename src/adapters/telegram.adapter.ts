import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const axios = require('axios');

@Injectable()
export class TelegramAdapter {
  private axiosInstance: AxiosInstance;
  constructor(private readonly configService: ConfigService) {
    const token = configService.get<string>('TELEGRAM_TOKEN');
    this.axiosInstance = axios.create({
      baseURL: `https://api.telegram.org/bot${token}`,
    });
  }
  async setWebhook() {
    const telegramWebhookUrl = this.configService.get<string>(
      'TELEGRAM_WEBHOOK_URL',
    );
    await this.axiosInstance.post(`setWebhook`, {
      url: telegramWebhookUrl,
    });
  }

  async sendMessage(text: string, recipientId: number) {
    await this.axiosInstance.post(`sendMessage`, {
      chat_id: recipientId,
      text: text,
    });
  }
}

export type TelegramUpdateMessage = {
  message: {
    from: {
      id: number;
      first_name: string;
      last_name: string;
    };
    text: string;
  };
};
