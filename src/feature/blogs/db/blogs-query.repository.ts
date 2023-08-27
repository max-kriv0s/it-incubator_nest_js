import { Injectable } from '@nestjs/common';
import { QueryParams } from '../../../dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginatorBlogSql,
  PaginatorBlogSqlType,
  ViewBlogDto,
} from '../dto/view-blog.dto';
import { Blog } from '../entities/blog.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  NewestLikesType,
  PaginatorPostSql,
  PaginatorPostView,
  PostQueryRawType,
  PostQueryType,
  ViewPostDto,
} from '../../../feature/posts/dto/view-post.dto';
import { Post } from '../../../feature/posts/entities/post.entity';
import { LikeStatus } from '../../../feature/likes/dto/like-status';
import { PostLike } from '../../../feature/posts/entities/post-like.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog) private readonly blogsRepo: Repository<Blog>,
    @InjectRepository(Post) private readonly postsRepo: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postLikesRepo: Repository<PostLike>,
  ) {}

  async getBlogs(
    queryParams: QueryParams,
    paginator: PaginatorBlogSql,
  ): Promise<PaginatorBlogSqlType> {
    const searchNameTerm: string = queryParams.searchNameTerm ?? '';
    const sortBy: string = queryParams.sortBy ?? 'createdAt';
    const sortDirection: string = queryParams.sortDirection ?? 'desc';

    const [blogs, totalCount] = await this.blogsRepo
      .createQueryBuilder('b')
      .where('NOT b."isBanned" AND b."name" ILIKE :searchNameTerm', {
        searchNameTerm: `%${searchNameTerm}%`,
      })
      .orderBy(`b.${sortBy}`, sortDirection === 'desc' ? 'DESC' : 'ASC')
      .limit(paginator.pageSize)
      .offset(paginator.skip)
      .getManyAndCount();

    const blogsView = blogs.map((blog) => this.blogDBToBlogView(blog));
    return paginator.paginate(totalCount, blogsView);
  }

  async getBlogById(id: number): Promise<ViewBlogDto | null> {
    const blog = await this.blogsRepo.findOne({
      where: {
        id,
        isBanned: false,
      },
    });
    if (!blog) return null;
    return this.blogDBToBlogView(blog);
  }

  private blogDBToBlogView(blog: Blog): ViewBlogDto {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  }

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

  async findPostsByBlogId(
    blogId: number,
    queryParams: QueryParams,
    paginator: PaginatorPostSql,
    userId?: number,
  ): Promise<PaginatorPostView | null> {
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const blog = await this.blogsRepo.findOneBy({
      id: blogId,
      isBanned: false,
    });
    if (!blog) return null;

    const [findPosts, totalCount] = await this.postsRepo
      .createQueryBuilder('p')
      .where('p."blogId" = :blogId AND NOT p."isBanned"', { blogId })
      .orderBy(`p.${sortBy}`, sortDirection === 'desc' ? 'DESC' : 'ASC')
      .limit(paginator.pageSize)
      .offset(paginator.skip)
      .getManyAndCount();

    if (!findPosts.length) return paginator.paginate(totalCount, []);
    const postsIds = findPosts.map((post) => post.id);

    const queryCountLikeDislike = this.queryCountLikeDislike(postsIds);
    const queryMyStatus = this.queryMyStatus(postsIds, userId);
    const queryNewestLikes = this.queryNewestLikes(postsIds, userId);

    const newestLikesRaw: NewestLikesType[] = await this.newestLikesRaw(
      postsIds,
      queryNewestLikes,
    );

    const postsRaw: PostQueryRawType[] = await this.postsRepo
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
      .addSelect('COALESCE(ld_count."likesCount", 0)', 'likesCount')
      .addSelect('COALESCE(ld_count."dislikesCount", 0)', 'dislikesCount')
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
      .orderBy(`post.${sortBy}`, sortDirection === 'desc' ? 'DESC' : 'ASC')
      .setParameters(queryMyStatus.getParameters())
      .setParameters(queryCountLikeDislike.getParameters())
      .setParameters(queryNewestLikes.getParameters())
      .setParameter('likeNone', LikeStatus.None)
      .getRawMany();

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

  private postsDBToPostsView(post: PostQueryType): ViewPostDto {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: +post.likesCount,
        dislikesCount: +post.dislikesCount,
        myStatus: post.myStatus,
        newestLikes: post.newestLikes.map((like) => ({
          addedAt: like.addedAt.toISOString(),
          userId: like.userId.toString(),
          login: like.login,
        })),
      },
    };
  }
}
