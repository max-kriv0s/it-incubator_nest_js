import { Injectable } from '@nestjs/common';
import {
  NewestLikesType,
  PaginatorPostSql,
  PaginatorPostSqlType,
  PostQueryRawType,
  PostQueryType,
  ViewPostDto,
} from '../dto/view-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { LikeStatus } from '../../../feature/likes/dto/like-status';
import { PostLike } from '../entities/post-like.entity';
import { QueryParams } from '../../../dto';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post) private readonly postsRepo: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postLikesRepo: Repository<PostLike>,
  ) {}

  paramUserId(userId?: number) {
    return userId ? userId : null;
  }

  queryCountLikeDislike(postsIds: number[]) {
    return this.postLikesRepo
      .createQueryBuilder('ld_count')
      .select('ld_count.postId', 'postId')
      .addSelect(
        `SUM(CASE
        WHEN ld_count.status = :like
          THEN 1
        ELSE 0
        END)`,
        'likesCount',
      )
      .addSelect(
        `SUM(CASE
        WHEN ld_count.status = :dislike
                THEN 1
              ELSE 0
          END)`,
        'dislikesCount',
      )
      .where(
        'ld_count."postId" IN (:...postsIds) AND NOT ld_count."isBanned"',
        {
          postsIds,
          like: LikeStatus.Like,
          dislike: LikeStatus.Dislike,
        },
      )
      .groupBy('ld_count."postId"');
  }

  queryMyStatus(postsIds: number[], userId?: number) {
    return this.postLikesRepo
      .createQueryBuilder('pl')
      .select('pl.status', 'status')
      .addSelect('pl.postId', 'postId')
      .where('pl.postId IN (:...postsIds) and pl.userId =:userId', {
        postsIds,
        userId: this.paramUserId(userId),
      });
  }

  queryNewestLikes(postsIds: number[], userId?: number) {
    return this.postLikesRepo
      .createQueryBuilder('nl')
      .select([
        'nl.postId as "postId"',
        'nl.addedAt as "addedAt"',
        'nl.userId as "userId"',
      ])
      .addSelect('user.login', 'login')
      .leftJoin('nl.user', 'user')
      .where(
        'nl.postId IN (:...postsIds) AND nl.status = :like AND NOT nl.isBanned',
        {
          postsIds,
          like: LikeStatus.Like,
          userId: this.paramUserId(userId),
        },
      )
      .orderBy('nl.addedAt', 'DESC')
      .limit(3);
  }

  async newestLikesRaw(
    postsIds: number[],
    queryNewestLikes: SelectQueryBuilder<PostLike>,
  ): Promise<NewestLikesType[]> {
    return this.postsRepo
      .createQueryBuilder('post')
      .select('post.id')
      .leftJoinAndSelect(
        `(${queryNewestLikes.getQuery()})`,
        'nl',
        'nl."postId" = post.id',
      )
      .where('post.id IN (:...postsIds)', { postsIds })
      .setParameters(queryNewestLikes.getParameters())
      .getRawMany();
  }

  async getPostById(id: number, userId?: number): Promise<ViewPostDto | null> {
    const queryCountLikeDislike = this.queryCountLikeDislike([id]);
    const queryMyStatus = this.queryMyStatus([id], userId);
    const queryNewestLikes = this.queryNewestLikes([id], userId);

    const newestLikesRaw: NewestLikesType[] = await this.newestLikesRaw(
      [id],
      queryNewestLikes,
    );

    const postRaw: PostQueryRawType | undefined = await this.postsRepo
      .createQueryBuilder('post')
      .select([
        'post.id as id',
        'post.title as title',
        'post.shortDescription as "shortDescription"',
        'post.content as content',
        'post.blogId as "blogId"',
        'post.createdAt as "createdAt"',
      ])
      .addSelect('blog.name', 'blogName')
      .addSelect(`COALESCE(pl.status, :likeNone)`, 'myStatus')
      .addSelect('COALESCE(ld_count."likesCount", 0)::int', 'likesCount')
      .addSelect('COALESCE(ld_count."dislikesCount", 0)::int', 'dislikesCount')
      .leftJoin('post.blog', 'blog')
      .leftJoin(`(${queryMyStatus.getQuery()})`, 'pl', 'pl."postId" = post.id')
      .leftJoin(
        `(${queryCountLikeDislike.getQuery()})`,
        'ld_count',
        'ld_count."postId" = post.id',
      )
      .leftJoinAndMapMany(
        'post.newestLikes',
        `(${queryNewestLikes.getQuery()})`,
        'nl',
        'nl."postId" = post.id',
      )
      .where('post.id = :id AND NOT post."isBanned"', { id })
      .setParameters(queryMyStatus.getParameters())
      .setParameters(queryCountLikeDislike.getParameters())
      .setParameters(queryNewestLikes.getParameters())
      .setParameter('likeNone', LikeStatus.None)
      .getRawOne();

    if (!postRaw) return null;

    const post: PostQueryType = {
      ...postRaw,
      newestLikes: newestLikesRaw.filter((like) => like.postId === postRaw.id),
    };
    return this.postsDBToPostsView(post);
  }

  private postsDBToPostsView(post: PostQueryType): ViewPostDto {
    return {
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        dislikesCount: post.dislikesCount,
        likesCount: post.likesCount,
        myStatus: post.myStatus,
        newestLikes: post.newestLikes.map((like) => ({
          addedAt: like.addedAt.toISOString(),
          userId: like.userId.toString(),
          login: like.login,
        })),
      },
      id: post.id.toString(),
      shortDescription: post.shortDescription,
      title: post.title,
    };
  }

  async getPosts(
    queryParams: QueryParams,
    paginator: PaginatorPostSql,
    userId?: number,
  ): Promise<PaginatorPostSqlType> {
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const queryFindPosts = this.postsRepo
      .createQueryBuilder('p')
      .addSelect('blog.name')
      .leftJoin('p.blog', 'blog')
      .where('NOT p."isBanned"')
      .limit(paginator.pageSize)
      .offset(paginator.skip);

    if (sortBy === 'blogName') {
      queryFindPosts.orderBy(
        `blog."name"`,
        sortDirection === 'desc' ? 'DESC' : 'ASC',
      );
    } else {
      queryFindPosts.orderBy(
        `p."${sortBy}"`,
        sortDirection === 'desc' ? 'DESC' : 'ASC',
      );
    }

    const [findPosts, totalCount] = await queryFindPosts.getManyAndCount();

    if (!findPosts.length) return paginator.paginate(totalCount, []);
    const postsIds = findPosts.map((post) => post.id);

    const queryCountLikeDislike = this.queryCountLikeDislike(postsIds);
    const queryMyStatus = this.queryMyStatus(postsIds, userId);
    const queryNewestLikes = this.queryNewestLikes(postsIds, userId);

    const newestLikesRaw: NewestLikesType[] = await this.newestLikesRaw(
      postsIds,
      queryNewestLikes,
    );

    const query = this.postsRepo
      .createQueryBuilder('post')
      .select([
        'post.id as id',
        'post.title as title',
        'post.shortDescription as "shortDescription"',
        'post.content as content',
        'post.blogId as "blogId"',
        'post.createdAt as "createdAt"',
      ])
      .addSelect('blog.name', 'blogName')
      .addSelect(`COALESCE(pl.status, :likeNone)`, 'myStatus')
      .addSelect('COALESCE(ld_count."likesCount", 0)::int', 'likesCount')
      .addSelect('COALESCE(ld_count."dislikesCount", 0)::int', 'dislikesCount')
      .leftJoin('post.blog', 'blog')
      .leftJoin(`(${queryMyStatus.getQuery()})`, 'pl', 'pl."postId" = post.id')
      .leftJoin(
        `(${queryCountLikeDislike.getQuery()})`,
        'ld_count',
        'ld_count."postId" = post.id',
      )
      .leftJoinAndMapMany(
        'post.newestLikes',
        `(${queryNewestLikes.getQuery()})`,
        'nl',
        'nl."postId" = post.id',
      )
      .where('post.id IN (:...postsIds)', { postsIds })
      .setParameters(queryMyStatus.getParameters())
      .setParameters(queryCountLikeDislike.getParameters())
      .setParameters(queryNewestLikes.getParameters())
      .setParameter('likeNone', LikeStatus.None);

    if (sortBy === 'blogName') {
      query.orderBy(`blog."name"`, sortDirection === 'desc' ? 'DESC' : 'ASC');
    } else {
      query.orderBy(
        `post."${sortBy}"`,
        sortDirection === 'desc' ? 'DESC' : 'ASC',
      );
    }

    const postsRaw: PostQueryRawType[] = await query.getRawMany();

    const postsView = postsRaw.map((postRaw) => {
      const post: PostQueryType = {
        ...postRaw,
        newestLikes: newestLikesRaw.filter(
          (like) => like.postId === postRaw.id,
        ),
      };
      return this.postsDBToPostsView(post);
    });
    return paginator.paginate(totalCount, postsView);
  }
}
