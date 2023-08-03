import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../db/posts.repository';
import { LikePostsRepository } from '../db/like-posts.repository';
import { LikePostsDocument } from '../model/like-posts.schema';
import { CountLikeDislikeDto } from '../../../feature/likes/dto/count-like-dislike.dto';
import { LikeStatus } from '../../../feature/likes/dto/like-status';

export class CountLikesPostsCommand {
  constructor(public userId: string, public ban: boolean) {}
}

@CommandHandler(CountLikesPostsCommand)
export class CountLikesPostsUseCase
  implements ICommandHandler<CountLikesPostsCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly likePostsRepository: LikePostsRepository,
  ) {}

  async execute(command: CountLikesPostsCommand): Promise<boolean> {
    const likes = await this.likePostsRepository.findLikesByUserId(
      command.userId,
    );
    if (!likes) return false;

    for (const like of likes) {
      await this.updateBanLike(like, command.ban);
      await this.updateCountLikeDislike(like, command.ban);
      await this.updatePostNewestLikes(like.postId.toString());
    }

    return true;
  }

  private async updateBanLike(like: LikePostsDocument, ban: boolean) {
    like.setUserIsBanned(ban);
    this.likePostsRepository.save(like);
  }

  private async updateCountLikeDislike(like: LikePostsDocument, ban: boolean) {
    const count = ban ? -1 : 1;

    const countDto: CountLikeDislikeDto = {
      countLike: like.status === LikeStatus.Like ? count : 0,
      countDislike: like.status === LikeStatus.Dislike ? count : 0,
    };
    this.postsRepository.updateCountLikeDislike(
      like.postId.toString(),
      countDto,
    );
  }

  private async updatePostNewestLikes(postId: string) {
    const post = await this.postsRepository.findPostById(postId);
    if (post) {
      post.newestLikes = await this.likePostsRepository.getNewestLikes(post.id);
      await this.postsRepository.save(post);
    }
  }
}
