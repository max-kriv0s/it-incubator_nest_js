import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../../../feature/users/entities/user.entity';
import { LikeStatus } from '../../../feature/likes/dto/like-status';

@Entity({ name: 'CommentLikes' })
export class CommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  commentId: number;

  @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' })
  comment: Comment;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.commentLikes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user: User;

  @Column({ type: 'enum', enum: LikeStatus, default: LikeStatus.None })
  status: LikeStatus;

  @Column({ default: false })
  isBanned: boolean;
}
