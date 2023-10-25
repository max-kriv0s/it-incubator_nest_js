import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntityClass } from '../../../modules/entities/base.entity';
import { Blog } from './blog.entity';
import { User } from '../../../feature/users/entities/user.entity';

export enum SubscriptionStatuses {
  Subscribed = 'Subscribed',
  Unsubscribed = 'Unsubscribed',
  None = 'None',
}

@Entity({ name: 'BlogSubscribers' })
export class BlogSubscriber extends BaseEntityClass {
  @Column()
  blogId: number;

  @ManyToOne(() => Blog, (blog) => blog.subscribers)
  blog: Blog;

  @Column()
  subscriberId: number;

  @ManyToOne(() => User)
  subscriber: User;

  @Column({
    type: 'enum',
    enum: SubscriptionStatuses,
    default: SubscriptionStatuses.None,
  })
  status: SubscriptionStatuses;

  subscribe() {
    this.status = SubscriptionStatuses.Subscribed;
  }

  unsubscribe() {
    this.status = SubscriptionStatuses.Unsubscribed;
  }
}
