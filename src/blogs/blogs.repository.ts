import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from './blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogDto } from './dto/create-blog.dto';
import { validID } from 'src/utils';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async createBlog(blogDto: CreateBlogDto): Promise<BlogDocument> {
    return this.BlogModel.createBlog(blogDto, this.BlogModel);
  }

  async findBlogById(id: string): Promise<BlogDocument | null> {
    if (!validID(id)) return null;
    return this.BlogModel.findById(id).exec();
  }

  async deleteBlogById(id: string): Promise<BlogDocument | null> {
    if (!validID(id)) return null;
    return this.BlogModel.findByIdAndDelete(id);
  }

  async save(blog: BlogDocument): Promise<BlogDocument> {
    return blog.save();
  }
}
