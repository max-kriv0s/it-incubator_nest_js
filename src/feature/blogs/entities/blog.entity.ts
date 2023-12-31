import { BloggerBannedUser } from '../../../feature/bloggers/entities/blogger-banned-user.entity';
import { Post } from '../../../feature/posts/entities/post.entity';
import { User } from '../../../feature/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogPhotosEntity } from './blog-photo.entity';
import { BlogSubscriber } from './blog-subscribers.entity';

@Entity({ name: 'Blogs' })
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 15 })
  name: string;

  @Column('text')
  description: string;

  @Column({ length: 100 })
  websiteUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isMembership: boolean;

  @Column({ nullable: true })
  ownerId: number;

  @ManyToOne(() => User, (user) => user.blogs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  owner: User;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ type: Date, nullable: true })
  banDate: Date | null;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];

  @OneToMany(() => BloggerBannedUser, (bannedUser) => bannedUser.blog)
  bloggerBannedUsers: BloggerBannedUser[];

  @OneToMany(() => BlogPhotosEntity, (blogPhoto) => blogPhoto.blog)
  photos: BlogPhotosEntity[];

  @OneToMany(() => BlogSubscriber, (blogSubscriber) => blogSubscriber.blog)
  subscribers: BlogSubscriber[];
}
