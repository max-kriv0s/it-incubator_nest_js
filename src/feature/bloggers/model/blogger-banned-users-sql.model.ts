export class BloggerBannedUsersRawSqlDocument {
  id: number;
  blogId: number;
  bannedUserId: number;
  isBanned: boolean;
  banDate: Date | null;
  banReason: string | null;
}

export class BloggerBannedUsersSqlDocument {
  id: string;
  blogId: string;
  bannedUserId: string;
  isBanned: boolean;
  banDate: Date | null;
  banReason: string | null;
}

export class BloggerQueryBannedUsersRawSqlDocument {
  id: number;
  blogId: number;
  bannedUserId: number;
  bannedUserLogin: string;
  isBanned: boolean;
  banDate: Date | null;
  banReason: string | null;
}

export function convertBloggerBannedUsersRawToSql(
  bannedUser: BloggerBannedUsersRawSqlDocument,
): BloggerBannedUsersSqlDocument {
  return {
    ...bannedUser,
    id: bannedUser.id.toString(),
    blogId: bannedUser.blogId.toString(),
    bannedUserId: bannedUser.bannedUserId.toString(),
  };
}
