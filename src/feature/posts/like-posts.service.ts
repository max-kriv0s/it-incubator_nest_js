// import { Injectable } from '@nestjs/common';
// import { NewestLikes, PostDocument } from './model/post.schema';
// import { LikePostsRepository } from './db/like-posts.repository';
// import { LikeStatus } from '../likes/dto/like-status';
// import { LikePostsDocument } from './model/like-posts.schema';
// import { ViewLikeDetailsDto } from '../likes/dto/view-like.dto';
// import { CountLikeDislikeDto } from '../likes/dto/count-like-dislike.dto';

// @Injectable()
// export class LikePostsService {
//   constructor(private readonly likePostsRepository: LikePostsRepository) {}

//   async ChangeLike(
//     postId: string,
//     userId: string,
//     login: string,
//     likeStatus: LikeStatus,
//   ): Promise<CountLikeDislikeDto> {
//     const result: CountLikeDislikeDto = {
//       countLike: 0,
//       countDislike: 0,
//     };
//     let oldStatus = LikeStatus.None;

//     let like = await this.likePostsRepository.findLikeByPostIdAndUserId(
//       postId,
//       userId,
//     );

//     if (like) {
//       oldStatus = like.getStatus();
//       like.setStatus(likeStatus);
//     } else {
//       like = this.likePostsRepository.createLikePosts(
//         postId,
//         userId,
//         login,
//         likeStatus,
//       );
//     }
//     await this.likePostsRepository.save(like);

//     if (oldStatus === likeStatus) return result;

//     const fromNoneToLike =
//       oldStatus === LikeStatus.None && likeStatus === LikeStatus.Like;
//     if (fromNoneToLike) result.countLike += 1;

//     const fromNoneToDislike =
//       oldStatus === LikeStatus.None && likeStatus === LikeStatus.Dislike;
//     if (fromNoneToDislike) result.countDislike += 1;

//     const fromLikeToNone =
//       oldStatus === LikeStatus.Like && likeStatus === LikeStatus.None;
//     if (fromLikeToNone) result.countLike -= 1;

//     const fromDislikeToNone =
//       oldStatus === LikeStatus.Dislike && likeStatus === LikeStatus.None;
//     if (fromDislikeToNone) result.countDislike -= 1;

//     const fromLikeToDislike =
//       oldStatus === LikeStatus.Like && likeStatus === LikeStatus.Dislike;
//     if (fromLikeToDislike) {
//       result.countLike -= 1;
//       result.countDislike += 1;
//     }

//     const fromDislikeToLike =
//       oldStatus === LikeStatus.Dislike && likeStatus === LikeStatus.Like;
//     if (fromDislikeToLike) {
//       result.countLike += 1;
//       result.countDislike -= 1;
//     }

//     return result;
//   }

//   async getNewestLikes(postId: string): Promise<NewestLikes[]> {
//     return this.likePostsRepository.getNewestLikes(postId);
//   }
// }
