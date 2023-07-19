import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from './post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateBlogPostDto } from '../blogs/dto/create-blog-post.dto';
import { CountLikeDislikeDto } from '../likes/dto/count-like-dislike.dto';
import { castToObjectId } from '../../utils';
import { Types } from 'mongoose';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  createPost(postDto: CreatePostDto, blogName: string): PostDocument {
    return this.PostModel.createPost(postDto, blogName, this.PostModel);
  }

  async deletePostById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findByIdAndDelete(id);
  }

  async findPostById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findById(id).exec();
  }

  async deletePosts() {
    await this.PostModel.deleteMany({});
  }

  createPostByBlogId(
    blogId: string,
    blogName: string,
    blogPostDto: CreateBlogPostDto,
  ): PostDocument {
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

  async updateCountLikeDislike(
    id: string,
    countDto: CountLikeDislikeDto,
  ): Promise<PostDocument | null> {
    return this.PostModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          likesCount: countDto.countLike,
          dislikesCount: countDto.countDislike,
        },
      },
      { new: true },
    );
  }

  async postExists(id: string): Promise<number> {
    return this.PostModel.countDocuments({ _id: castToObjectId(id) });
  }

  async findPostsByblogId(blogId: string): Promise<PostDocument[]> {
    return this.PostModel.find({ blogId: castToObjectId(blogId) });
  }

  async updateBlockingFlagForPosts(
    postsId: Types.ObjectId[],
    isBanned: boolean,
  ): Promise<boolean> {
    const result = await this.PostModel.updateMany(
      { _id: { $in: postsId } },
      { isBanned },
    );
    return result.acknowledged;
  }
}
