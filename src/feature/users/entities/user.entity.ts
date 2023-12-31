import { CommentLike } from '../../../feature/comments/entities/comment-likes.entity';
import { BloggerBannedUser } from '../../../feature/bloggers/entities/blogger-banned-user.entity';
import { Blog } from '../../../feature/blogs/entities/blog.entity';
import { Comment } from '../../../feature/comments/entities/comment.entity';
import { PostLike } from '../../../feature/posts/entities/post-like.entity';
import { SecurityDevice } from '../../../feature/security-devices/entities/security-device.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TelegramUserAccounts } from '../telegram-user-accounts/entities/telegram-user-accounts.entity';

@Entity({ name: 'Users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10, collation: 'C' })
  login: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  confirmationCode: string;

  @Column({ nullable: true })
  emailConfirmationExpirationDate: Date;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column({ nullable: true })
  passwordRecoveryCode: string;

  @Column({ nullable: true })
  passwordRecoveryExpirationDate: Date;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ type: Date, nullable: true })
  banDate: Date | null;

  @Column({ type: String, nullable: true })
  banReason: string | null;

  @OneToMany(() => Blog, (blog) => blog.owner)
  blogs: Blog[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => SecurityDevice, (device) => device.user)
  securityDevices: SecurityDevice[];

  @OneToMany(() => BloggerBannedUser, (bannedUser) => bannedUser.bannedUser)
  bloggerBannedUsers: BloggerBannedUser[];

  @OneToMany(() => PostLike, (postLike) => postLike.user)
  postLikes: PostLike;

  @OneToMany(() => CommentLike, (like) => like.user)
  commentLikes: CommentLike[];

  banUnban(isBanned: boolean, banReason: string) {
    this.isBanned = isBanned;
    this.banDate = isBanned ? new Date() : null;
    this.banReason = isBanned ? banReason : null;
  }

  @OneToOne(() => TelegramUserAccounts)
  @JoinColumn()
  telegramAccount: TelegramUserAccounts;
}
