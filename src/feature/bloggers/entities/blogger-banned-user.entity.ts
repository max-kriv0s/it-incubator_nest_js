import { User } from '../../../feature/users/entities/user.entity';
import { Blog } from '../../../feature/blogs/entities/blog.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'BloggerBannedUsers' })
export class BloggerBannedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  blogId: number;

  @ManyToOne(() => Blog, (blog) => blog.bloggerBannedUsers, {
    onDelete: 'CASCADE',
  })
  blog: Blog;

  @Column()
  bannedUserId: number;

  @ManyToOne(() => User, (user) => user.bloggerBannedUsers, {
    onDelete: 'CASCADE',
  })
  bannedUser: User;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ type: Date, nullable: true, default: null })
  banDate: Date | null;

  @Column({ type: String, nullable: true, default: null })
  banReason: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
