import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserBanBlogInputDto } from '../dto/user-ban-blog-input.dto';
import { BlogsRepository } from '../../../feature/blogs/db/blogs.repository';
import { PostsRepository } from '../../../feature/posts/db/posts.repository';

export class UserBanUnbanBlogCommand {
  constructor(public blogId: number, public inputDto: UserBanBlogInputDto) {}
}

@CommandHandler(UserBanUnbanBlogCommand)
export class UserBanUnbanBlogUseCase
  implements ICommandHandler<UserBanUnbanBlogCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: UserBanUnbanBlogCommand): Promise<boolean> {
    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) return false;

    blog.isBanned = command.inputDto.isBanned;
    blog.banDate = command.inputDto.isBanned ? new Date() : null;
    await this.blogsRepository.save(blog);

    await this.postsRepository.setBanUnbanePostsByBlogId(
      command.blogId,
      command.inputDto.isBanned,
    );
    return true;
  }
}
