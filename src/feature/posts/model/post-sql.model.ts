export class PostSqlDocument {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  isBanned: boolean;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
  newestLikes: NewestLikesType[];
}

export type NewestLikesType = {
  addedAt: Date;
  userId: string;
  login: string;
};
