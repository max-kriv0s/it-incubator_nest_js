import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from './post.schema';
import { validID } from '../utils';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateBlogPostDto } from '../blogs/dto/create-blog-post.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async createPost(
    postDto: CreatePostDto,
    blogName: string,
  ): Promise<PostDocument> {
    return this.PostModel.createPost(postDto, blogName, this.PostModel);
  }

  async deletePostById(id: string): Promise<PostDocument | null> {
    if (!validID(id)) return null;
    return this.PostModel.findByIdAndDelete(id);
  }

  async findPostById(id: string): Promise<PostDocument | null> {
    if (!validID(id)) return null;
    return this.PostModel.findById(id).exec();
  }

  async deletePosts() {
    await this.PostModel.deleteMany({});
  }

  async createPostByBlogId(
    blogId: string,
    blogName: string,
    blogPostDto: CreateBlogPostDto,
  ): Promise<PostDocument> {
    const postDto: CreatePostDto = {
      title: blogPostDto.title,
      content: blogPostDto.content,
      shortDescription: blogPostDto.shortDescription,
      blogId: blogId,
    };
    return this.PostModel.createPost(postDto, blogName, this.PostModel);
  }

  async save(post: PostDocument): Promise<PostDocument> {
    return post.save();
  }
}
