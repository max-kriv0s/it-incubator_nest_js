import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from './blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogDto } from './dto/create-blog.dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  createBlog(blogDto: CreateBlogDto): BlogDocument {
    return this.BlogModel.createBlog(blogDto, this.BlogModel);
  }

  async findBlogById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findById(id).exec();
  }

  async deleteBlogById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findByIdAndDelete(id);
  }

  async deleteBlogs() {
    await this.BlogModel.deleteMany({});
  }

  async save(blog: BlogDocument): Promise<BlogDocument> {
    return blog.save();
  }
}
