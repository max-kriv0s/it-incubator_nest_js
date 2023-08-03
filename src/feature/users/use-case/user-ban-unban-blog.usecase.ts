import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserBanBlogInputDto } from '../dto/user-ban-blog-input.dto';
import { PostsRepository } from '../../posts/db/posts.repository';
import { BlogsRepository } from '../../../feature/blogs/db/blogs.repository';

export class UserBanUnbanBlogCommand {
  constructor(public blogId: string, public inputDto: UserBanBlogInputDto) {}
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

    blog.setBanUnbaneOwner(command.inputDto.isBanned);
    await this.blogsRepository.save(blog);

    const posts = await this.postsRepository.findPostsByblogId(command.blogId);
    const postsId = posts.map((post) => post._id);
    return this.postsRepository.updateBlockingFlagForPosts(
      postsId,
      command.inputDto.isBanned,
    );
  }
}
