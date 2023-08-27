import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../../feature/blogs/entities/blog.entity';
import {
  PaginatorBloggerBlogSql,
  PaginatorBloggerBlogSqlViewType,
  PaginatorBloggerPostSql,
  PaginatorBloggerpostSqlViewType,
  ViewBloggerBlogDto,
  ViewBloggerPostDto,
} from '../dto/view-blogger-blogs.dto';
import { BloggerQueryParams } from '../dto/blogger-query-params.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { LikeStatus } from '../../../feature/likes/dto/like-status';
import { Post } from '../../../feature/posts/entities/post.entity';
import { PostLike } from '../../../feature/posts/entities/post-like.entity';
import {
  NewestLikesType,
  PostQueryRawType,
  PostQueryType,
} from '../../../feature/posts/dto/view-post.dto';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { BloggerBannedUsersQueryParams } from '../dto/blogger-banned-users-query-param.dto';
import {
  PaginatorViewBloggerBannedUsersSql,
  PaginatorViewBloggerBannedUsersSqlType,
  ViewBloggerBannedUsersDto,
} from '../dto/view-blogger-banned-users.dto';
import { BloggerBannedUser } from '../entities/blogger-banned-user.entity';
import { IPaginator } from '../../../dto';
import {
  PaginatorViewBloggerCommentsDto,
  ViewBloggerCommentsDto,
} from '../dto/view-blogger-comments.dto';
import { Comment } from '../../../feature/comments/entities/comment.entity';
import { CommentLike } from '../../../feature/comments/entities/comment-likes.entity';
import { CommentQueryRawType } from '../../../feature/comments/dto/view-comment.dto';

@Injectable()
export class BloggerQueryRepository {
  constructor(
    @InjectRepository(Blog) private readonly blogsRepository: Repository<Blog>,
    @InjectRepository(Post) private readonly postsRepo: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postLikesRepo: Repository<PostLike>,
    @InjectRepository(BloggerBannedUser)
    private readonly bloggerBannedUsersRepo: Repository<BloggerBannedUser>,
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    @InjectRepository(CommentLike)
    private readonly commentLikesRepo: Repository<CommentLike>,
  ) {}

  async getBlogs(
    queryParams: BloggerQueryParams,
    userId: number,
    paginator: PaginatorBloggerBlogSql,
  ): Promise<PaginatorBloggerBlogSqlViewType> {
    const searchNameTerm: string = queryParams.searchNameTerm ?? '';
    const sortBy: string = queryParams.sortBy ?? 'createdAt';
    const sortDirection: string = queryParams.sortDirection ?? 'desc';

    const [blogs, totalCount] = await this.blogsRepository
      .createQueryBuilder('blogs')
      .where('blogs."name" ILIKE :searchNameTerm', {
        searchNameTerm: `%${searchNameTerm}%`,
      })
      .andWhere('blogs.ownerId = :userId', { userId })
      .orderBy(`blogs.${sortBy}`, sortDirection === 'desc' ? 'DESC' : 'ASC')
      .limit(paginator.pageSize)
      .offset(paginator.skip)
      .getManyAndCount();

    const blogsView = blogs.map((blog) => this.blogDBToBlogView(blog));
    return paginator.paginate(totalCount, blogsView);
  }

  async getBlogById(id: number): Promise<ViewBloggerBlogDto | null> {
    const blog = await this.blogsRepository.findOneBy({ id });
    if (!blog) return null;
    return this.blogDBToBlogView(blog);
  }

  blogDBToBlogView(blog: Blog): ViewBloggerBlogDto {
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

  async getPostById(
    id: number,
    userId?: number,
  ): Promise<ViewBloggerPostDto | null> {
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
      .where('post.id = :id', { id })
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

  private postsDBToPostsView(post: PostQueryType): ViewBloggerPostDto {
    return {
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        dislikesCount: +post.dislikesCount,
        likesCount: +post.likesCount,
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

  async findPostsByBlogId(
    blogId: number,
    queryParams: BloggerQueryParams,
    userId: number,
    paginator: PaginatorBloggerPostSql,
  ): Promise<ResultNotification<PaginatorBloggerpostSqlViewType>> {
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const result = new ResultNotification<PaginatorBloggerpostSqlViewType>();

    const blog = await this.blogsRepository.findOneBy({ id: blogId });

    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }
    if (blog.ownerId !== userId) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    const [findPosts, totalCount] = await this.postsRepo
      .createQueryBuilder('p')
      .where('p."blogId" = :blogId', { blogId })
      .orderBy(`p.${sortBy}`, sortDirection === 'desc' ? 'DESC' : 'ASC')
      .limit(paginator.pageSize)
      .offset(paginator.skip)
      .getManyAndCount();

    const postsIds = findPosts.map((post) => post.id);
    if (!postsIds.length) {
      const postsViewPagination = paginator.paginate(totalCount, []);
      result.addData(postsViewPagination);
      return result;
    }

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

    const postsViewPagination = paginator.paginate(totalCount, postsView);
    result.addData(postsViewPagination);
    return result;
  }

  async getAllBannedUsersForBlog(
    blogId: number,
    userId: number,
    queryParams: BloggerBannedUsersQueryParams,
    paginator: PaginatorViewBloggerBannedUsersSql,
  ): Promise<ResultNotification<PaginatorViewBloggerBannedUsersSqlType>> {
    const searchLoginTerm: string = queryParams.searchLoginTerm ?? '';
    const sortBy: string = queryParams.sortBy ?? 'createdAt';
    const sortDirection: string = queryParams.sortDirection ?? 'desc';

    const result =
      new ResultNotification<PaginatorViewBloggerBannedUsersSqlType>();

    const blog = await this.blogsRepository.findOneBy({ id: blogId });
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }
    if (blog.ownerId !== userId) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }
    if (blog.isBanned) {
      result.addError('Access is denied', ResultCodeError.Forbidden);
      return result;
    }

    const [bannedUsers, totalCount] = await this.bloggerBannedUsersRepo
      .createQueryBuilder('bu')
      .addSelect('user.login')
      .leftJoin('bu.bannedUser', 'user')
      .where('bu.blogId = :blogId AND bu.isBanned', { blogId })
      .andWhere('user.login ILIKE :searchLoginTerm', {
        searchLoginTerm: `%${searchLoginTerm}%`,
      })
      .orderBy(`bu."${sortBy}"`, sortDirection === 'desc' ? 'DESC' : 'ASC')
      .limit(paginator.pageSize)
      .offset(paginator.skip)
      .getManyAndCount();

    const bannedUsersView: ViewBloggerBannedUsersDto[] = bannedUsers.map(
      (bannedUser) => ({
        id: bannedUser.bannedUserId.toString(),
        login: bannedUser.bannedUser.login,
        banInfo: {
          isBanned: bannedUser.isBanned,
          banDate: bannedUser.banDate
            ? bannedUser.banDate.toISOString()
            : bannedUser.banDate,
          banReason: bannedUser.banReason,
        },
      }),
    );

    const paginateView = paginator.paginate(totalCount, bannedUsersView);
    result.addData(paginateView);
    return result;
  }

  async allCommentsForAllPostsInsideBlogs(
    queryParams: BloggerQueryParams,
    userId: number,
    paginator: IPaginator<ViewBloggerCommentsDto>,
  ): Promise<PaginatorViewBloggerCommentsDto> {
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const [findComments, totalCount] = await this.commentsRepo
      .createQueryBuilder('c')
      .select('c.id')
      .leftJoin('c.post', 'post')
      .leftJoin('post.blog', 'blog')
      .where('blog."ownerId" = :userId', { userId })
      .orderBy(`c.${sortBy}`, sortDirection === 'desc' ? 'DESC' : 'ASC')
      .limit(paginator.pageSize)
      .offset(paginator.skip)
      .getManyAndCount();

    const commentsIds = findComments.map((comment) => comment.id);
    if (!commentsIds.length) return paginator.paginate(totalCount, []);

    const queryCountLikeDislike = this.commentLikesRepo
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
      .where('l."commentId" IN (:...commentsIds) AND NOT l."isBanned"', {
        commentsIds,
        like: LikeStatus.Like,
        dislike: LikeStatus.Dislike,
      })
      .groupBy('l."commentId"');

    const queryMyStatus = this.commentLikesRepo
      .createQueryBuilder('mys')
      .select('mys.status', 'status')
      .addSelect('mys.commentId', 'commentId')
      .where('mys.commentId IN (:...commentsIds) and mys.userId =:userId', {
        commentsIds,
        userId: this.paramUserId(userId),
      });

    const commentsRaw: CommentQueryRawType[] = await this.commentsRepo
      .createQueryBuilder('c')
      .select([
        'c.id as id',
        'c.content as content',
        'c.createdAt as "createdAt"',
        'c.userId as "userId"',
        'user.login as "userLogin"',
        'post.id as "postId"',
        'post.title as title',
        'post.blogId as "blogId"',
        'blog.name as "blogName"',
      ])
      .addSelect(`COALESCE(mys.status, :likeNone)`, 'myStatus')
      .addSelect('COALESCE(l."likesCount", 0)', 'likesCount')
      .addSelect('COALESCE(l."dislikesCount", 0)', 'dislikesCount')
      .leftJoin('c.user', 'user')
      .leftJoin('c.post', 'post')
      .leftJoin('post.blog', 'blog')
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
      .where('c.id IN (:...commentsIds)', { commentsIds: [1] })
      .orderBy(`c.${sortBy}`, sortDirection === 'desc' ? 'DESC' : 'ASC')
      .setParameters(queryMyStatus.getParameters())
      .setParameters(queryCountLikeDislike.getParameters())
      .setParameter('likeNone', LikeStatus.None)
      .getRawMany();

    const commentsView = commentsRaw.map((comment) =>
      this.commentToCommentView(comment),
    );
    return paginator.paginate(totalCount, commentsView);
  }

  private commentToCommentView(
    comment: CommentQueryRawType,
  ): ViewBloggerCommentsDto {
    return {
      id: comment.id.toString(),
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      commentatorInfo: {
        userId: comment.userId.toString(),
        userLogin: comment.userLogin,
      },
      likesInfo: {
        likesCount: +comment.likesCount,
        dislikesCount: +comment.dislikesCount,
        myStatus: comment.myStatus,
      },
      postInfo: {
        blogId: comment.blogId.toString(),
        blogName: comment.blogName,
        title: comment.title,
        id: comment.postId.toString(),
      },
    };
  }
}
