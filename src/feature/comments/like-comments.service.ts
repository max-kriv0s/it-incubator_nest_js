import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../likes/dto/like-status';
import { CountLikeDislikeDto } from '../likes/dto/count-like-dislike.dto';
import { LikeCommentsRepository } from './like-comments.repository';

@Injectable()
export class LikeCommentsService {
  constructor(
    private readonly likeCommentsRepository: LikeCommentsRepository,
  ) {}

  async ChangeLike(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<CountLikeDislikeDto> {
    const result: CountLikeDislikeDto = {
      countLike: 0,
      countDislike: 0,
    };
    let oldStatus = LikeStatus.None;

    let like = await this.likeCommentsRepository.findLikeByCommentIdAndUserId(
      commentId,
      userId,
    );

    if (like) {
      oldStatus = like.getStatus();
      like.setStatus(likeStatus);
    } else {
      like = this.likeCommentsRepository.createLike(
        commentId,
        userId,
        likeStatus,
      );
    }
    await this.likeCommentsRepository.save(like);

    if (oldStatus === likeStatus) return result;

    const fromNoneToLike =
      oldStatus === LikeStatus.None && likeStatus === LikeStatus.Like;
    if (fromNoneToLike) result.countLike += 1;

    const fromNoneToDislike =
      oldStatus === LikeStatus.None && likeStatus === LikeStatus.Dislike;
    if (fromNoneToDislike) result.countDislike += 1;

    const fromLikeToNone =
      oldStatus === LikeStatus.Like && likeStatus === LikeStatus.None;
    if (fromLikeToNone) result.countLike -= 1;

    const fromDislikeToNone =
      oldStatus === LikeStatus.Dislike && likeStatus === LikeStatus.None;
    if (fromDislikeToNone) result.countDislike -= 1;

    const fromLikeToDislike =
      oldStatus === LikeStatus.Like && likeStatus === LikeStatus.Dislike;
    if (fromLikeToDislike) {
      result.countLike -= 1;
      result.countDislike += 1;
    }

    const fromDislikeToLike =
      oldStatus === LikeStatus.Dislike && likeStatus === LikeStatus.Like;
    if (fromDislikeToLike) {
      result.countLike += 1;
      result.countDislike -= 1;
    }

    return result;
  }
}
