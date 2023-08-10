import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  BlogRawSqlDocument,
  BlogSqlDocument,
  CreateBlogSqlType,
  convertBlogRawSqlToSqlDocument,
} from '../model/blog-sql.model';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@Injectable()
export class BlogsSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createBlog(dto: CreateBlogSqlType): Promise<BlogSqlDocument | null> {
    const blogs: BlogRawSqlDocument[] = await this.dataSource.query(
      `INSERT INTO public."Blogs"
      ("name", "description", "websiteUrl", "ownerId")
      VALUES
      ($1, $2, $3, $4)
      RETURNING *`,
      [dto.name, dto.description, dto.websiteUrl, +dto.ownerId],
    );
    if (!blogs.length) return null;
    return convertBlogRawSqlToSqlDocument(blogs[0]);
  }

  async findBlogById(id: string): Promise<BlogSqlDocument | null> {
    const blogs: BlogRawSqlDocument[] = await this.dataSource.query(
      `SELECT *
        FROM public."Blogs"
        WHERE id = $1`,
      [+id],
    );
    if (!blogs.length) return null;
    return convertBlogRawSqlToSqlDocument(blogs[0]);
  }

  async updateBlog(id: string, dto: UpdateBlogDto) {
    await this.dataSource.query(
      `UPDATE public."Blogs"
      SET "name" = $2, "description" = $3, "websiteUrl" = $4
      WHERE "id" = $1`,
      [+id, dto.name, dto.description, dto.websiteUrl],
    );
  }

  async deleteBlogById(id: string) {
    await this.dataSource.query(
      `DELETE FROM public."Blogs"
      WHERE "id" = $1`,
      [+id],
    );
  }
  async deleteBlogs() {
    await this.dataSource.query(`DELETE FROM public."Blogs"`);
  }

  async setBanUnbaneBlogByOwnerId(ownerId: string, isBanned: boolean) {
    await this.dataSource.query(
      `UPDATE public."Blogs"
        SET "isBanned" = $2 
        WHERE "ownerId" = $1`,
      [+ownerId, isBanned],
    );
  }
  async setBanUnbaneBlog(id: string, isBanned: boolean) {
    const banDate = isBanned ? new Date() : null;
    await this.dataSource.query(
      `UPDATE public."Blogs"
        SET "isBanned" = $2, "banDate" = $3 
        WHERE "id" = $1`,
      [+id, isBanned, banDate],
    );
  }

  async updateOwnerById(id: string, userId: string) {
    await this.dataSource.query(
      `UPDATE public."Blogs"
        SET "ownerId" = $2 
        WHERE "id" = $1`,
      [+id, userId],
    );
  }

  async updateBanUnban(userId: string, isBanned: boolean) {
    await this.dataSource.query(
      `UPDATE public."Blogs"
        SET "isBanned" = $2 
        WHERE "ownerId" = $1`,
      [+userId, isBanned],
    );
  }
}
