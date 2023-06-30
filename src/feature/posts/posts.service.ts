import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { UpdatePostDto } from './dto/update-post.dto';
import { BlogsRepository } from '../blogs/blogs.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDocument } from './post.schema';
import { CreateBlogPostDto } from '../blogs/dto/create-blog-post.dto';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { UsersService } from '../users/users.service';
import { CommentsService } from '../comments/comments.service';
import { LikeStatus } from '../likes/dto/like-status';
import { LikePostsService } from './like-posts.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersService: UsersService,
    private readonly commentsService: CommentsService,
    private readonly likePostsService: LikePostsService,
  ) {}

  async createPost(postDto: CreatePostDto): Promise<string> {
    const blog = await this.blogsRepository.findBlogById(postDto.blogId);
    if (!blog) throw new NotFoundException('Blog not found');

    const newPost = this.postsRepository.createPost(postDto, blog.name);
    const createdPost = await this.postsRepository.save(newPost);

    return createdPost._id.toString();
  }

  async updatePost(id: string, postDto: UpdatePostDto) {
    const blog = await this.blogsRepository.findBlogById(postDto.blogId);
    if (!blog) throw new NotFoundException('Blog not found');

    const post = await this.postsRepository.findPostById(id);
    if (!post) throw new NotFoundException('Post not found');

    post.updatePost(postDto, blog._id, blog.name);
    await this.postsRepository.save(post);
  }

  async deletePostById(id: string) {
    const deletedPost = await this.postsRepository.deletePostById(id);
    if (!deletedPost) throw new NotFoundException('Post not found');
  }

  async findPostById(id: string): Promise<PostDocument | null> {
    return this.postsRepository.findPostById(id);
  }

  async createPostByBlogId(
    blogId: string,
    blogName: string,
    blogPostDto: CreateBlogPostDto,
  ): Promise<string> {
    const newPost = this.postsRepository.createPostByBlogId(
      blogId,
      blogName,
      blogPostDto,
    );

    const createdPost = await this.postsRepository.save(newPost);
    return createdPost._id.toString();
  }

  async createCommentByPostID(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<string | null> {
    const post = await this.findPostById(postId);
    if (!post) return null;

    const user = await this.usersService.findUserById(userId);
    if (!user) return null;

    return this.commentsService.createCommentByPostId(
      postId,
      userId,
      user.accountData.login,
      createCommentDto,
    );
  }

  async likeStatusByPostID(
    postId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    const post = await this.postsRepository.findPostById(postId);
    if (!post) return false;

    const user = await this.usersService.findUserById(userId);
    if (!user) return false;

    const countLikeDislyke = await this.likePostsService.ChangeLike(
      postId,
      userId,
      user.accountData.login,
      likeStatus,
    );
    post.updateCountLikeDislike(countLikeDislyke);
    post.newestLikes = await this.likePostsService.getNewestLikes(post.id);

    await this.postsRepository.save(post);
    return true;
  }
}
