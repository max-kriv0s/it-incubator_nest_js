import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CountLikeDislikeDto } from '../../../feature/likes/dto/count-like-dislike.dto';
import { LikeStatus } from 'src/feature/likes/dto/like-status';
import { CommentsRepository } from '../comments.repository';
import { LikeCommentsRepository } from '../like-comments.repository';
import { LikeCommentsDocument } from '../like-comments.schema';

export class CountLikesCommentsCommand {
  constructor(public userId: string, public ban: boolean) {}
}

@CommandHandler(CountLikesCommentsCommand)
export class CountLikesCommentsUseCase
  implements ICommandHandler<CountLikesCommentsCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly likeCommentsRepository: LikeCommentsRepository,
  ) {}

  async execute(command: CountLikesCommentsCommand): Promise<boolean> {
    const likes = await this.likeCommentsRepository.findLikesByUserId(
      command.userId,
    );
    if (!likes) return false;

    await Promise.all(
      likes.map((like) => {
        this.updateBanLike(like, command.ban);
        this.updateCountLikeDislike(like, command.ban);
      }),
    );

    return true;
  }

  private async updateBanLike(like: LikeCommentsDocument, ban: boolean) {
    like.setUserIsBanned(ban);
    this.likeCommentsRepository.save(like);
  }

  private async updateCountLikeDislike(
    like: LikeCommentsDocument,
    ban: boolean,
  ) {
    const count = ban ? -1 : 1;

    const countDto: CountLikeDislikeDto = {
      countLike: like.status === LikeStatus.Like ? count : 0,
      countDislike: like.status === LikeStatus.Dislike ? count : 0,
    };
    this.commentsRepository.updateCountLikeDislike(
      like.commentId.toString(),
      countDto,
    );
  }
}
