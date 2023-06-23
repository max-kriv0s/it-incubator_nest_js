import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogsRepository } from './blogs.repository';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { PostsRepository } from '../posts/posts.repository';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async createBlog(blogDto: CreateBlogDto): Promise<string> {
    const newBlog = this.blogsRepository.createBlog(blogDto);
    const createdBlog = await this.blogsRepository.save(newBlog);
    return createdBlog._id.toString();
  }

  async updateBlog(id: string, blogDto: UpdateBlogDto) {
    const blog = await this.blogsRepository.findBlogById(id);
    if (!blog) throw new NotFoundException('Blog not found');

    blog.updateBlog(blogDto);
    await this.blogsRepository.save(blog);
  }

  async deleteBlogById(id: string) {
    const deletedBlog = await this.blogsRepository.deleteBlogById(id);
    if (!deletedBlog) throw new NotFoundException('Blog not found');
  }

  async createPostByBlogId(
    blogId: string,
    blogPostDto: CreateBlogPostDto,
  ): Promise<string | null> {
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) return null;

    const newPost = this.postsRepository.createPostByBlogId(
      blogId,
      blog.name,
      blogPostDto,
    );
    const createdPost = await this.postsRepository.save(newPost);
    return createdPost._id.toString();
  }
}
