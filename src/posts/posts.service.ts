import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { UpdatePostDto } from './dto/update-post.dto';
import { BlogsRepository } from '../blogs/blogs.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDocument } from './post.schema';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
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
}
