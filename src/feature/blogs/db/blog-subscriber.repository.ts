import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BlogSubscriber,
  SubscriptionStatuses,
} from '../entities/blog-subscribers.entity';

@Injectable()
export class BlogSubscriberRepository {
  constructor(
    @InjectRepository(BlogSubscriber)
    private readonly blogSubscribes: Repository<BlogSubscriber>,
  ) {}

  async findSubscriberByBlogIdAbdUserId(
    blogId: number,
    subscriberId: number,
  ): Promise<BlogSubscriber | null> {
    return this.blogSubscribes.findOneBy({ blogId, subscriberId });
  }

  async findActiveSubscribesByBlogId(
    blogId: number,
  ): Promise<BlogSubscriber[]> {
    return this.blogSubscribes
      .createQueryBuilder('bs')
      .leftJoinAndSelect('bs.subscriber', 'subscriber')
      .leftJoinAndSelect('subscriber.telegramAccount', 'telegramAccount')
      .where('bs.blogId = :blogId AND bs.status = :status', {
        blogId,
        status: SubscriptionStatuses.Subscribed,
      })
      .getMany();
  }

  async save(subscriber: BlogSubscriber): Promise<void> {
    await this.blogSubscribes.save(subscriber);
  }
}
