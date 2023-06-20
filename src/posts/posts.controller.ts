import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsQueryRepository } from './posts-query.repository';
import { PostsService } from './posts.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { calcResultDto } from 'src/utils';
import { PaginatorPostView, ViewPostDto } from './dto/view-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryParams, ResultCode } from 'src/dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  async getPosts(
    @Query() queryParams: QueryParams,
  ): Promise<PaginatorPostView> {
    try {
      return this.postsQueryRepository.getPosts(queryParams);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async createPost(
    @Body() postDto: CreatePostDto,
  ): Promise<ViewPostDto | null> {
    try {
      const resultCreatedPost = await this.postsService.createPost(postDto);
      if (resultCreatedPost.code !== ResultCode.Success) {
        return calcResultDto<null>(
          resultCreatedPost.code,
          null,
          resultCreatedPost.errorMessage,
        );
      }

      const createdPost = resultCreatedPost.data;
      if (!createdPost) {
        throw new HttpException(
          'Post not created',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const result = await this.postsQueryRepository.getPostById(
        createdPost._id,
      );

      return calcResultDto<ViewPostDto>(
        result.code,
        result.data as ViewPostDto,
        result.errorMessage,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getPostById(@Param('id') id: string): Promise<ViewPostDto> {
    try {
      const result = await this.postsQueryRepository.getPostById(id);

      return calcResultDto<ViewPostDto>(
        result.code,
        result.data as ViewPostDto,
        result.errorMessage,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() postDto: UpdatePostDto) {
    try {
      const result = await this.postsService.updatePost(id, postDto);
      return calcResultDto(result.code, result.data, result.errorMessage);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    try {
      const deletedPost = this.postsService.deletePostById(id);
      if (!deletedPost) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }

      return;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
