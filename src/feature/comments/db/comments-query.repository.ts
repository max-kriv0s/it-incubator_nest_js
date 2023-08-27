import { Injectable } from '@nestjs/common';
import {
  PaginatorCommentSqlType,
  ViewCommentDto,
} from '../dto/view-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment.entity';
import { Repository } from 'typeorm';
import { CommentLike } from '../entities/comment-likes.entity';
import { LikeStatus } from '../../../feature/likes/dto/like-status';
import { IPaginator, QueryParams } from '../../../dto';
import { Post } from '../../../feature/posts/entities/post.entity';

type CommentQueryRawType = {
  id: number;
  content: string;
  createdAt: Date;
  userId: number;
  userLogin: string;
  myStatus: LikeStatus;
  likesCount: number;
  dislikesCount: number;
  isBanned: boolean;
};

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(CommentLike)
    private readonly commentLikesRepo: Repository<CommentLike>,
    @InjectRepository(Post) private readonly postsRepo: Repository<Post>,
  ) {}

  paramUserId(userId?: number) {
    return userId ? userId : null;
  }

  queryCountLikeDislike(commentIds: number[]) {
    return this.commentLikesRepo
      .createQueryBuilder('l')
      .select('l.commentId', 'commentId')
      .addSelect(
        `SUM(CASE WHEN l.status = :like THEN 1 ELSE 0 END)`,
        'likesCount',
      )
      .addSelect(
        `SUM(CASE WHEN l.status = :dislike THEN 1 ELSE 0 END)`,
        'dislikesCount',
      )
      .where('l."commentId" IN (:...commentIds) AND NOT l."isBanned"', {
        commentIds,
        like: LikeStatus.Like,
        dislike: LikeStatus.Dislike,
      })
      .groupBy('l."commentId"');
  }

  queryMyStatus(commentIds: number[], userId?: number) {
    return this.commentLikesRepo
      .createQueryBuilder('mys')
      .select('mys.status', 'status')
      .addSelect('mys.commentId', 'commentId')
      .where('mys.commentId IN (:...commentIds) and mys.userId =:userId', {
        commentIds,
        userId: this.paramUserId(userId),
      });
  }

  async getCommentViewById(
    id: number,
    userId?: number,
  ): Promise<ViewCommentDto | null> {
    const queryCountLikeDislike = this.queryCountLikeDislike([id]);
    const queryMyStatus = this.queryMyStatus([id], userId);

    const commentRaw: CommentQueryRawType | undefined = await this.commentsRepo
      .createQueryBuilder('c')
      .select([
        'c.id as id',
        'c.content as content',
        'c.createdAt as "createdAt"',
        'c.userId as "userId"',
        'c."isBanned" as "isBanned"',
        'user.login as "userLogin"',
      ])
      .addSelect(`COALESCE(mys.status, :likeNone)`, 'myStatus')
      .addSelect('COALESCE(l."likesCount", 0)', 'likesCount')
      .addSelect('COALESCE(l."dislikesCount", 0)', 'dislikesCount')
      .leftJoin('c.user', 'user')
      .leftJoin(
        `(${queryMyStatus.getQuery()})`,
        'mys',
        'mys."commentId" = c.id',
      )
      .leftJoin(
        `(${queryCountLikeDislike.getQuery()})`,
        'l',
        'l."commentId" = c.id',
      )
      .where('c.id = :id', { id })
      .setParameters(queryMyStatus.getParameters())
      .setParameters(queryCountLikeDislike.getParameters())
      .setParameter('likeNone', LikeStatus.None)
      .getRawOne();

    if (!commentRaw) return null;
    if (commentRaw.isBanned) return null;

    return this.commentDBToCommentView(commentRaw);
  }

  commentDBToCommentView(comment: CommentQueryRawType): ViewCommentDto {
    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId.toString(),
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: +comment.likesCount,
        dislikesCount: +comment.dislikesCount,
        myStatus: comment.myStatus,
      },
    };
  }

  async findCommentsByPostId(
    postId: number,
    queryParams: QueryParams,
    paginator: IPaginator<ViewCommentDto>,
    userId?: number,
  ): Promise<PaginatorCommentSqlType | null> {
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const post = await this.postsRepo.findOneBy({ id: postId });
    if (!post) return null;

    const [findComments, totalCount] = await this.commentsRepo
      .createQueryBuilder('c')
      .where('c."postId" = :postId AND NOT c."isBanned"', { postId })
      .orderBy(`c.${sortBy}`, sortDirection === 'desc' ? 'DESC' : 'ASC')
      .limit(paginator.pageSize)
      .offset(paginator.skip)
      .getManyAndCount();

    if (!findComments.length) return paginator.paginate(totalCount, []);

    const commentsIds = findComments.map((comment) => comment.id);
    const queryCountLikeDislike = this.queryCountLikeDislike(commentsIds);
    const queryMyStatus = this.queryMyStatus(commentsIds, userId);

    const commentsRaw: CommentQueryRawType[] = await this.commentsRepo
      .createQueryBuilder('c')
      .select([
        'c.id as id',
        'c.content as content',
        'c.createdAt as "createdAt"',
        'c.userId as "userId"',
        'c."isBanned" as "isBanned"',
        'user.login as "userLogin"',
      ])
      .addSelect(`COALESCE(mys.status, :likeNone)`, 'myStatus')
      .addSelect('COALESCE(l."likesCount", 0)', 'likesCount')
      .addSelect('COALESCE(l."dislikesCount", 0)', 'dislikesCount')
      .leftJoin('c.user', 'user')
      .leftJoin(
        `(${queryMyStatus.getQuery()})`,
        'mys',
        'mys."commentId" = c.id',
      )
      .leftJoin(
        `(${queryCountLikeDislike.getQuery()})`,
        'l',
        'l."commentId" = c.id',
      )
      .where('c.id IN (:...commentsIds)', { commentsIds })
      .orderBy(`c.${sortBy}`, sortDirection === 'desc' ? 'DESC' : 'ASC')
      .setParameters(queryMyStatus.getParameters())
      .setParameters(queryCountLikeDislike.getParameters())
      .setParameter('likeNone', LikeStatus.None)
      .getRawMany();

    const commentsView = commentsRaw.map((comment) =>
      this.commentDBToCommentView(comment),
    );
    return paginator.paginate(totalCount, commentsView);
  }
}
