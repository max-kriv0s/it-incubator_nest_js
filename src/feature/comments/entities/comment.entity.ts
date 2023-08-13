import { User } from '../../../feature/users/entities/user.entity';
import { Post } from '../../../feature/posts/entities/post.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommentLike } from './comment-likes.entity';

@Entity({ name: 'Comments' })
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ length: 300 })
  content: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @OneToMany(() => CommentLike, (like) => like.comment)
  likes: CommentLike[];
}
