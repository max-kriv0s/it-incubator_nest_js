import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';
import { User } from '../../users/entities/user.entity';
import { LikeStatus } from '../../likes/dto/like-status';

@Entity({ name: 'PostLikes' })
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @ManyToOne(() => Post, (post) => post.likes)
  post: Post;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.postLikes)
  user: User;

  @Column({ default: new Date() })
  addedAt: Date;

  @Column({ type: 'enum', enum: LikeStatus, default: LikeStatus.None })
  status: LikeStatus;

  @Column({ default: false })
  isBanned: boolean;
}
