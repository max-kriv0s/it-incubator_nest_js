import { Comment } from '../../../feature/comments/entities/comment.entity';
import { Blog } from '../../../feature/blogs/entities/blog.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostLike } from './post-like.entity';

@Entity({ name: 'Posts' })
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  title: string;

  @Column({ length: 100 })
  shortDescription: string;

  @Column('text')
  content: string;

  @Column()
  blogId: number;

  @ManyToOne(() => Blog, (blog) => blog.posts)
  blog: Blog;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ default: new Date() })
  createdAt: Date;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostLike, (postLike) => postLike.post)
  likes: PostLike[];
}
