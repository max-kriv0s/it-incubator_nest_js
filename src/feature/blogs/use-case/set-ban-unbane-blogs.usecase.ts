import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../blogs.repository';

export class SetBanUnbanBlogsCommand {
  constructor(public ownerId: string, public valueBan: boolean) {}
}

@CommandHandler(SetBanUnbanBlogsCommand)
export class SetBanUnbanBlogsUseCase
  implements ICommandHandler<SetBanUnbanBlogsCommand>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: SetBanUnbanBlogsCommand): Promise<boolean> {
    const blogs = await this.blogsRepository.findBlogsByOwnerId(
      command.ownerId,
    );
    if (!blogs) return false;

    // убрать промис
    await Promise.all(
      blogs.map((blog) => {
        blog.setBanUnbaneOwner(command.valueBan);
        this.blogsRepository.save(blog);
      }),
    );

    return true;
  }
}
