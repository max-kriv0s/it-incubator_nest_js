import { Injectable } from '@nestjs/common';
import { UpdatePostDto } from './dto/update-post.dto';
import { BlogsRepository } from '../blogs/db/blogs.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDocument } from './model/post.schema';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { UsersService } from '../users/users.service';
import { CommentsService } from '../comments/comments.service';
import { LikeStatus } from '../likes/dto/like-status';
import { LikePostsService } from './like-posts.service';
import {
  ResultCodeError,
  ResultNotification,
} from '../../modules/notification';
import { BloggersRepository } from '../bloggers/db/bloggers.repository';
import { PostsRepository } from './db/posts.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersService: UsersService,
    private readonly commentsService: CommentsService,
    private readonly likePostsService: LikePostsService,
    private readonly bloggersRepository: BloggersRepository,
  ) {}

  async createPost(postDto: CreatePostDto): Promise<string | null> {
    const blog = await this.blogsRepository.findBlogById(postDto.blogId);
    if (!blog) return null;

    const newPost = this.postsRepository.createPost(postDto, blog.name);
    const createdPost = await this.postsRepository.save(newPost);

    return createdPost._id.toString();
  }

  async updatePost(
    id: string,
    postDto: UpdatePostDto,
  ): Promise<ResultNotification<boolean>> {
    const result = new ResultNotification<boolean>();

    const blog = await this.blogsRepository.findBlogById(postDto.blogId);
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }

    const post = await this.postsRepository.findPostById(id);
    if (!post) {
      result.addError('Post not found', ResultCodeError.NotFound);
      return result;
    }

    post.updatePost(postDto, blog._id, blog.name);
    await this.postsRepository.save(post);

    result.addData(true);
    return result;
  }

  async deletePostById(id: string): Promise<boolean> {
    const result = await this.postsRepository.deletePostById(id);
    return result !== null;
  }

  async findPostById(id: string): Promise<PostDocument | null> {
    return this.postsRepository.findPostById(id);
  }

  // async createPostByBlogId(
  //   blogId: string,
  //   blogName: string,
  //   blogPostDto: CreateBlogPostDto,
  // ): Promise<string> {
  //   const newPost = this.postsRepository.createPostByBlogId(
  //     blogId,
  //     blogName,
  //     blogPostDto,
  //   );

  //   const createdPost = await this.postsRepository.save(newPost);
  //   return createdPost._id.toString();
  // }

  async createCommentByPostID(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<ResultNotification<string>> {
    const result = new ResultNotification<string>();

    const post = await this.findPostById(postId);
    if (!post) {
      result.addError('Post not found', ResultCodeError.NotFound);
      return result;
    }

    const user = await this.usersService.findUserById(userId);
    if (!user) {
      result.addError('user not found', ResultCodeError.NotFound);
      return result;
    }

    const isBannedUser =
      await this.bloggersRepository.findBannedUserByBlogIdAndUserId(
        post.blogId.toString(),
        userId,
      );
    if (isBannedUser) {
      {
        result.addError('The user is blocked', ResultCodeError.Forbidden);
        return result;
      }
    }

    const commentId = await this.commentsService.createCommentByPostId(
      postId,
      userId,
      user.accountData.login,
      createCommentDto,
    );

    result.addData(commentId);
    return result;
  }

  async likeStatusByPostID(
    postId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    const postExists = await this.postsRepository.postExists(postId);
    if (!postExists) return false;

    const user = await this.usersService.findUserById(userId);
    if (!user) return false;

    const countLikeDislyke = await this.likePostsService.ChangeLike(
      postId,
      userId,
      user.accountData.login,
      likeStatus,
    );
    // записывать newestLikes при обновлении
    const isUpdated = await this.postsRepository.updateCountLikeDislike(
      postId,
      countLikeDislyke,
    );
    if (!isUpdated) return false;

    const post = await this.postsRepository.findPostById(postId);
    if (!post) return false;
    // post.updateCountLikeDislike(countLikeDislyke);
    post.newestLikes = await this.likePostsService.getNewestLikes(post.id);

    await this.postsRepository.save(post);
    return true;
  }
}
