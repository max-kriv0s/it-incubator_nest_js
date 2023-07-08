import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

export type BlogDocument = HydratedDocument<Blog>;

export type CreateUserBlockDto = CreateBlogDto & {
  blogOwner: BlogOwner;
};

@Schema()
export class BlogOwner {
  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ default: false })
  isBaned?: boolean;
}

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
  createdAt: Date;

  @Prop({ default: false })
  isMembership: boolean;

  @Prop({ required: true })
  blogOwner: BlogOwner;

  static createBlog(
    createDto: CreateUserBlockDto,
    BlogModel: BlogModelType,
  ): BlogDocument {
    const data: CreateUserBlockDto & { createdAt: Date } = {
      name: createDto.name,
      description: createDto.description,
      websiteUrl: createDto.websiteUrl,
      createdAt: new Date(),
      blogOwner: createDto.blogOwner,
    };

    return new BlogModel(data);
  }

  updateBlog(blogDto: UpdateBlogDto) {
    this.name = blogDto.name;
    this.description = blogDto.description;
    this.websiteUrl = blogDto.websiteUrl;
  }

  thisIsOwner(userId: string): boolean {
    return this.blogOwner.userId.toString() === userId;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  updateBlog: Blog.prototype.updateBlog,
  thisIsOwner: Blog.prototype.thisIsOwner,
};

export type BlogModelStaticType = {
  createBlog: (
    createDto: CreateUserBlockDto,
    BlogModel: BlogModelType,
  ) => BlogDocument;
};

const blogStaticMethods: BlogModelStaticType = {
  createBlog: Blog.createBlog,
};
BlogSchema.statics = blogStaticMethods;

export type BlogModelType = Model<Blog> & BlogModelStaticType;
