import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogsRepository } from './blogs.repository';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsService: PostsService,
  ) {}

  async createBlog(blogDto: CreateBlogDto): Promise<string> {
    const newBlog = this.blogsRepository.createBlog(blogDto);
    const createdBlog = await this.blogsRepository.save(newBlog);
    return createdBlog._id.toString();
  }

  async updateBlog(id: string, blogDto: UpdateBlogDto): Promise<boolean> {
    const blog = await this.blogsRepository.findBlogById(id);
    if (!blog) return false;

    blog.updateBlog(blogDto);
    await this.blogsRepository.save(blog);
    return true;
  }

  async deleteBlogById(id: string) {
    return this.blogsRepository.deleteBlogById(id);
  }

  async createPostByBlogId(
    blogId: string,
    blogPostDto: CreateBlogPostDto,
  ): Promise<string | null> {
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) return null;

    const postId = await this.postsService.createPostByBlogId(
      blogId,
      blog.name,
      blogPostDto,
    );

    return postId;
  }

  async findBlogById(id: string): Promise<string | null> {
    const blog = await this.blogsRepository.findBlogById(id);
    return blog ? blog.id : null;
  }
}
