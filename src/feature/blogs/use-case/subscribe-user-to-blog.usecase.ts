import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { BlogsRepository } from '../db/blogs.repository';
import { BlogSubscriberRepository } from '../db/blog-subscriber.repository';
import { BlogSubscriber } from '../entities/blog-subscribers.entity';

export class SubscribeUserToBlogCommand {
  constructor(public blogId: number, public subscriberId: number) {}
}

@CommandHandler(SubscribeUserToBlogCommand)
export class SubscribeUserToBlogUseCase
  implements ICommandHandler<SubscribeUserToBlogCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogSubscriberRepository: BlogSubscriberRepository,
  ) {}

  async execute({
    blogId,
    subscriberId,
  }: SubscribeUserToBlogCommand): Promise<ResultNotification> {
    const result = new ResultNotification();

    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }

    let subscriber =
      await this.blogSubscriberRepository.findSubscriberByBlogIdAbdUserId(
        blogId,
        subscriberId,
      );

    if (!subscriber) {
      subscriber = new BlogSubscriber();
      subscriber.blogId = blogId;
      subscriber.subscriberId = subscriberId;
    }

    subscriber.subscribe();
    await this.blogSubscriberRepository.save(subscriber);

    return result;
  }
}
