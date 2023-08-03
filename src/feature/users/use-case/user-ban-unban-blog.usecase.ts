import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserBanBlogInputDto } from '../dto/user-ban-blog-input.dto';
import { BlogsSqlRepository } from '../../../feature/blogs/db/blogs.sql-repository';
import { PostsSqlRepository } from '../../../feature/posts/db/posts.sql-repository';

export class UserBanUnbanBlogCommand {
  constructor(public blogId: string, public inputDto: UserBanBlogInputDto) {}
}

@CommandHandler(UserBanUnbanBlogCommand)
export class UserBanUnbanBlogUseCase
  implements ICommandHandler<UserBanUnbanBlogCommand>
{
  constructor(
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}

  async execute(command: UserBanUnbanBlogCommand): Promise<boolean> {
    const blog = await this.blogsSqlRepository.findBlogById(command.blogId);
    if (!blog) return false;

    await this.blogsSqlRepository.setBanUnbaneBlog(
      command.blogId,
      command.inputDto.isBanned,
    );

    await this.postsSqlRepository.setBanUnbanePostsByBlogId(
      command.blogId,
      command.inputDto.isBanned,
    );
    return true;
  }
}
