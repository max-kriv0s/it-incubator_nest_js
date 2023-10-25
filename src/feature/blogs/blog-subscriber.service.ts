import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BlogSubscriberRepository } from './db/blog-subscriber.repository';
import { TelegramAdapter } from '../../adapters/telegram.adapter';
import { PostCreatedEvent } from '../../events/post-created.event';

@Injectable()
export class BlogSubscriberService {
  constructor(
    private readonly blogSubscriberRepository: BlogSubscriberRepository,
    private readonly telegramAdapter: TelegramAdapter,
  ) {}

  @OnEvent('post.created')
  async informSubscribers(payload: PostCreatedEvent) {
    const subscriptions =
      await this.blogSubscriberRepository.findActiveSubscribesByBlogId(
        payload.blogId,
      );

    const message = `New post published for blog ${payload.blogName}`;

    for (const subscription of subscriptions) {
      if (subscription.subscriber.telegramAccount.telegramId) {
        this.telegramAdapter.sendMessage(
          message,
          subscription.subscriber.telegramAccount.telegramId,
        );
      }
    }
  }
}
