import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostDocument } from './post.schema';
import { ResultCode, ResultDto } from 'src/dto';
import { getResultDto } from 'src/other-utils';
import { UpdatePostDto } from './dto/update-post.dto';
import { BlogsRepository } from 'src/blogs/blogs.repository';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async createPost(postDto: CreatePostDto): Promise<ResultDto<PostDocument>> {
    const blog = await this.blogsRepository.findBlogById(postDto.blogId);
    if (!blog) {
      return getResultDto<PostDocument>(
        ResultCode.NotFound,
        null,
        'Blog not found',
      );
    }
    const newPost = await this.postsRepository.createPost(postDto, blog.name);
    const createdPost = await this.postsRepository.save(newPost);
    return getResultDto<PostDocument>(ResultCode.Success, createdPost);
  }

  async updatePost(
    id: string,
    postDto: UpdatePostDto,
  ): Promise<ResultDto<null>> {
    const blog = await this.blogsRepository.findBlogById(postDto.blogId);
    if (!blog) return getResultDto(ResultCode.NotFound, null, 'Blog not found');

    const post = await this.postsRepository.findPostById(id);
    if (!post) return getResultDto(ResultCode.NotFound, null, 'Post not found');

    post.updatePost(postDto, blog._id, blog.name);
    await this.postsRepository.save(post);

    return getResultDto(ResultCode.Success);
  }

  async deletePostById(id: string): Promise<PostDocument | null> {
    return this.postsRepository.deletePostById(id);
  }

  async findPostById(id: string): Promise<PostDocument | null> {
    return this.postsRepository.findPostById(id);
  }
}
