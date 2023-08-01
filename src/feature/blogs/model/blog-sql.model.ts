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
