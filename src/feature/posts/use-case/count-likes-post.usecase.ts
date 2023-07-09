import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../posts.repository';
import { LikePostsRepository } from '../like-posts.repository';
import { LikePostsDocument } from '../like-posts.schema';
import { CountLikeDislikeDto } from '../../../feature/likes/dto/count-like-dislike.dto';
import { LikeStatus } from 'src/feature/likes/dto/like-status';

export class CountLikesPostsCommand {
  constructor(public userId: string, public ban: boolean) {}
}

@CommandHandler(CountLikesPostsCommand)
export class CountLikesPostsUseCase implements ICommandHandler {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly likePostsRepository: LikePostsRepository,
  ) {}

  async execute(command: CountLikesPostsCommand): Promise<boolean> {
    const likes = await this.likePostsRepository.findLikesByUserId(
      command.userId,
    );
    if (!likes) return false;

    await Promise.all(
      likes.map((like) => {
        this.updateBanLike(like, command.ban);
        this.updateCountLikeDislike(like);
      }),
    );

    return true;
  }

  private async updateBanLike(like: LikePostsDocument, ban: boolean) {
    like.setUserIsBanned(ban);
    this.likePostsRepository.save(like);
  }

  private async updateCountLikeDislike(like: LikePostsDocument) {
    const countDto: CountLikeDislikeDto = {
      countLike: like.status === LikeStatus.Like ? -1 : 0,
      countDislike: like.status === LikeStatus.Dislike ? -1 : 0,
    };
    this.postsRepository.updateCountLikeDislike(
      like.postId.toString(),
      countDto,
    );
  }
}
