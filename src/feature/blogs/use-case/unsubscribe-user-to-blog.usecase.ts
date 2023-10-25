import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { BlogsRepository } from '../db/blogs.repository';
import { BlogSubscriberRepository } from '../db/blog-subscriber.repository';

export class UnsubscribeUserToBlogCommand {
  constructor(public blogId: number, public subscriberId: number) {}
}

@CommandHandler(UnsubscribeUserToBlogCommand)
export class UnsubscribeUserToBlogUseCase
  implements ICommandHandler<UnsubscribeUserToBlogCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogSubscriberRepository: BlogSubscriberRepository,
  ) {}

  async execute({
    blogId,
    subscriberId,
  }: UnsubscribeUserToBlogCommand): Promise<ResultNotification> {
    const result = new ResultNotification();

    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }

    const subscriber =
      await this.blogSubscriberRepository.findSubscriberByBlogIdAbdUserId(
        blogId,
        subscriberId,
      );

    if (!subscriber) {
      result.addError('Subscriber not found', ResultCodeError.NotFound);
      return result;
    }

    subscriber.unsubscribe();
    await this.blogSubscriberRepository.save(subscriber);

    return result;
  }
}
