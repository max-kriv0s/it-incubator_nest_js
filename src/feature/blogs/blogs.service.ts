import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogsRepository } from './blogs.repository';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { PostsService } from '../posts/posts.service';
import { BlogDocument } from './model/blog.schema';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsService: PostsService,
  ) {}

  async deleteBlogById(id: string) {
    return this.blogsRepository.deleteBlogById(id);
  }

  async findBlogById(id: string): Promise<string | null> {
    const blog = await this.blogsRepository.findBlogById(id);
    return blog ? blog.id : null;
  }

  async findBlogModelById(id: string): Promise<BlogDocument | null> {
    return await this.blogsRepository.findBlogById(id);
  }
}
