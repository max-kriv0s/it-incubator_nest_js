import { CommentLike } from '../../../feature/comments/entities/comment-likes.entity';
import { BloggerBannedUser } from '../../../feature/bloggers/entities/blogger-banned-user.entity';
import { Blog } from '../../../feature/blogs/entities/blog.entity';
import { Comment } from '../../../feature/comments/entities/comment.entity';
import { PostLike } from '../../../feature/posts/entities/post-like.entity';
import { SecurityDevice } from '../../../feature/security-devices/entities/security-device.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ default: new Date() })
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

  @Column({ nullable: true })
  banDate: Date;

  @Column({ nullable: true })
  banReason: string;

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
}
