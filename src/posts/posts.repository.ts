import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from './post.schema';
import { validID } from 'src/utils';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async createPost(
    postDto: CreatePostDto,
    blodName: string,
  ): Promise<PostDocument> {
    return this.PostModel.createPost(postDto, blodName, this.PostModel);
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

  async save(post: PostDocument): Promise<PostDocument> {
    return post.save();
  }
}
