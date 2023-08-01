import { CreateBlogDto } from '../dto/create-blog.dto';

export class BlogSqlDocument {
  id: number;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
  ownerId: number;
  isBanned: boolean;
  banDate: Date | null;
}

export type CreateBlogSqlType = CreateBlogDto & { ownerId: number };
