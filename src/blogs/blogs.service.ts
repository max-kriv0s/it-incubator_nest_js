import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogsRepository } from './blogs.repository';
import { BlogDocument } from './blog.schema';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ResultCode, ResultDto } from 'src/dto';
import { getResultDto } from 'src/utils';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async createBlog(blogDto: CreateBlogDto): Promise<BlogDocument> {
    const newBlog = await this.blogsRepository.createBlog(blogDto);
    const createdBlog = await this.blogsRepository.save(newBlog);
    return createdBlog;
  }

  async updateBlog(
    id: string,
    blogDto: UpdateBlogDto,
  ): Promise<ResultDto<null>> {
    const blog = await this.blogsRepository.findBlogById(id);
    if (!blog) return getResultDto(ResultCode.NotFound, null, 'Blog not found');

    blog.updateBlog(blogDto);
    await this.blogsRepository.save(blog);

    return getResultDto(ResultCode.Success);
  }

  async deleteBlogById(id: string) {
    const deletedBlog = await this.blogsRepository.deleteBlogById(id);
    if (!deletedBlog) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    }
  }
}
