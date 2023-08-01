import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogSqlDocument, CreateBlogSqlType } from '../model/blog-sql.model';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@Injectable()
export class BlogsSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createBlog(dto: CreateBlogSqlType): Promise<number | null> {
    const blogs: BlogSqlDocument[] = await this.dataSource.query(
      `INSERT INTO public."Blogs"
      ("name", "description", "websiteUrl", "ownerId")
      VALUES
      ($1, $2, $3, $4)
      RETURNING "id"`,
      [dto.name, dto.description, dto.websiteUrl, dto.ownerId],
    );
    if (!blogs.length) return null;
    return blogs[0].id;
  }

  async findBlogById(id: number): Promise<BlogSqlDocument | null> {
    const blogs: BlogSqlDocument[] = await this.dataSource.query(
      `SELECT *
        FROM public."Blogs"
        WHERE id = $1`,
      [id],
    );
    if (!blogs.length) return null;
    return blogs[0];
  }

  async updateBlog(id: number, dto: UpdateBlogDto) {
    await this.dataSource.query(
      `UPDATE public."Blogs"
      SET 
      WHERE "id"`,
      [id, dto.name, dto.description, dto.websiteUrl],
    );
  }

  async deleteBlogById(id: number) {
    await this.dataSource.query(
      `DELETE FROM public."Blogs"
      WHERE "id" = $1`,
      [id],
    );
  }
  async deleteBlogs() {
    await this.dataSource.query(`DELETE FROM public."Blogs"`);
  }
}
