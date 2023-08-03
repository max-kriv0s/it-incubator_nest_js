import { CreateBlogDto } from '../dto/create-blog.dto';

export class BlogRawSqlDocument {
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

export class UserBlogRawSqlDocument {
  id: number;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
  ownerId: number;
  ownerLogin: string;
  isBanned: boolean;
  banDate: Date | null;
}

export class BlogSqlDocument {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
  ownerId: string;
  isBanned: boolean;
  banDate: Date | null;
}

export type CreateBlogSqlType = CreateBlogDto & { ownerId: string };

export function convertBlogRawSqlToSqlDocument(
  blog: BlogRawSqlDocument,
): BlogSqlDocument {
  return {
    ...blog,
    id: blog.id.toString(),
    ownerId: blog.ownerId.toString(),
  };
}
