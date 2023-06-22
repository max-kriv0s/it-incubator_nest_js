import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ default: false })
  isMembership: boolean;

  static createBlog(
    blogDto: CreateBlogDto,
    BlogModel: BlogModelType,
  ): BlogDocument {
    const data: CreateBlogDto & { createdAt: string } = {
      name: blogDto.name,
      description: blogDto.description,
      websiteUrl: blogDto.websiteUrl,
      createdAt: new Date().toISOString(),
    };

    const newBlog = new BlogModel(data);
    return newBlog;
  }

  updateBlog(blogDto: UpdateBlogDto) {
    this.name = blogDto.name;
    this.description = blogDto.description;
    this.websiteUrl = blogDto.websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  updateBlog: Blog.prototype.updateBlog,
};

export type BlogModelStaticType = {
  createBlog: (
    blogDto: CreateBlogDto,
    BlogModel: BlogModelType,
  ) => BlogDocument;
};

const blogStaticMethods: BlogModelStaticType = {
  createBlog: Blog.createBlog,
};
BlogSchema.statics = blogStaticMethods;

export type BlogModelType = Model<Blog> & BlogModelStaticType;
