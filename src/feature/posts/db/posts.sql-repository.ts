import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  PostRawSqlDocument,
  PostSqlDocument,
  convertPostRawSqlToSqlDocument,
} from '../model/post-sql.model';
import { CreateBlogPostDto } from '../../../feature/blogs/dto/create-blog-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostsSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createPostByBlogId(
    blogId: string,
    blogPostDto: CreateBlogPostDto,
  ): Promise<PostSqlDocument> {
    const postsRaw: PostRawSqlDocument[] = await this.dataSource.query(
      `INSERT INTO public."Posts"
        ("title", "content", "shortDescription", "blogId")
        VALUES
        ($1, $2, $3, $4)
        RETURNING *`,
      [
        blogPostDto.title,
        blogPostDto.content,
        blogPostDto.shortDescription,
        blogId,
      ],
    );
    return convertPostRawSqlToSqlDocument(postsRaw[0]);
  }

  async findPostById(id: string): Promise<PostSqlDocument | null> {
    const postsRaw: PostRawSqlDocument[] = await this.dataSource.query(
      `SELECT *
      FROM public."Posts"
      WHERE "id" = $1`,
      [+id],
    );
    if (!postsRaw.length) return null;
    return convertPostRawSqlToSqlDocument(postsRaw[0]);
  }

  async updatePost(id: string, postDto: UpdatePostDto) {
    await this.dataSource.query(
      `UPDATE public."Posts"
      SET "title" = $2, "shortDescription" = $3, "content" = $4, "blogId" = $5
      WHERE "id" = $1`,
      [
        +id,
        postDto.title,
        postDto.shortDescription,
        postDto.content,
        postDto.blogId,
      ],
    );
  }

  async deletePostById(id: string) {
    await this.dataSource.query(
      `DELETE FROM public."Posts" 
      WHERE "id" = $1`,
      [+id],
    );
  }

  async deletePosts() {
    await this.dataSource.query(`DELETE FROM public."Posts"`);
  }

  async setBanUnbanePostsByBlogId(blogId: string, isBanned: boolean) {
    await this.dataSource.query(
      `UPDATE public."Posts"
        SET "isBanned" = $2 
        WHERE "blogIid" = $1`,
      [+blogId, isBanned],
    );
  }
}
