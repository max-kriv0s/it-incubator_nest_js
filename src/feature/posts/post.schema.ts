import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { CountLikeDislikeDto } from '../likes/dto/count-like-dislike.dto';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class NewestLikes {
  @Prop({ required: true })
  addedAt: Date;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  login: string;
}

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
  createdAt: Date;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  dislikesCount: number;

  @Prop({ default: [] })
  newestLikes: NewestLikes[];

  updatePost(postDto: UpdatePostDto, blogId: Types.ObjectId, blogName: string) {
    this.title = postDto.title;
    this.shortDescription = postDto.shortDescription;
    this.content = postDto.content;
    this.blogId = blogId;
    this.blogName = blogName;
  }

  updateCountLikeDislike(countDto: CountLikeDislikeDto) {
    this.likesCount += countDto.countLike;
    this.dislikesCount += countDto.countDislike;
  }

  static createPost(
    postDto: CreatePostDto,
    blogName: string,
    PostModel: PostModelType,
  ): PostDocument {
    const data: Omit<CreatePostDto, 'blogId'> & {
      blogId: Types.ObjectId;
      blogName: string;
      createdAt: Date;
    } = {
      title: postDto.title,
      shortDescription: postDto.shortDescription,
      content: postDto.content,
      blogId: new Types.ObjectId(postDto.blogId),
      blogName: blogName,
      createdAt: new Date(),
      // likesCount: 0,
      // dislikesCount: 0,
    };

    return new PostModel(data);
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {
  updatePost: Post.prototype.updatePost,
  updateCountLikeDislike: Post.prototype.updateCountLikeDislike,
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
