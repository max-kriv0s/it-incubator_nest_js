import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogsRepository } from './blogs.repository';
import { BlogDocument } from './blog.schema';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async createBlog(blogDto: CreateBlogDto): Promise<BlogDocument> {
    const newBlog = await this.blogsRepository.createBlog(blogDto);
    const createdBlog = await this.blogsRepository.save(newBlog);
    return createdBlog;
  }

  async updateBlog(id: string, blogDto: UpdateBlogDto) {
    const blog = await this.blogsRepository.findBlogById(id);
    if (!blog) {
      throw new HttpException('blog not fount', HttpStatus.NOT_FOUND);
    }

    blog.updateBlog(blogDto);

    await this.blogsRepository.save(blog);
  }

  async deleteBlogById(id: string) {
    const deletedBlog = await this.blogsRepository.deleteBlogById(id);
    if (!deletedBlog) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    }
  }
}
