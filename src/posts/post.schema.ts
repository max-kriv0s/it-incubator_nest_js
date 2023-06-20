import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/create-post.dto';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: Types.ObjectId;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  dislikesCount: number;

  updatePost(postDto: UpdatePostDto, blogId: Types.ObjectId, blogName: string) {
    this.title = postDto.title;
    this.shortDescription = postDto.shortDescription;
    this.content = postDto.content;
    this.blogId = blogId;
    this.blogName = blogName;
  }

  static createPost(
    postDto: CreatePostDto,
    blogName: string,
    PostModel: PostModelType,
  ): PostDocument {
    const data = {
      title: postDto.title,
      shortDescription: postDto.shortDescription,
      content: postDto.content,
      blogId: new Types.ObjectId(postDto.blogId),
      blogName: blogName,
      createdAt: new Date().toISOString(),
      // likesCount: 0,
      // dislikesCount: 0,
    };

    return new PostModel(data);
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {
  updatePost: Post.prototype.updatePost,
};

export type PostModelStaticType = {
  createPost: (
    postDto: CreatePostDto,
    blogName: string,
    PostModel: PostModelType,
  ) => PostDocument;
};

const postStaticMethods: PostModelStaticType = {
  createPost: Post.createPost,
};
PostSchema.statics = postStaticMethods;

export type PostModelType = Model<Post> & PostModelStaticType;
