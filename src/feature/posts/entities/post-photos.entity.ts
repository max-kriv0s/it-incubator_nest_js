import { Column, Entity, ManyToOne } from 'typeorm';
import { PhotoEntity } from '../../../modules/entities/photo.entity';
import { SizePhotoEnum } from '../../../modules/enums/size-photo.enum';
import { Post } from './post.entity';

@Entity({ name: 'PostPhotos' })
export class PostPhotosEntity extends PhotoEntity {
  @Column({
    type: 'enum',
    enum: SizePhotoEnum,
  })
  sizePhoto: SizePhotoEnum;

  @Column()
  postId: number;

  @ManyToOne(() => Post, (post) => post.photos)
  post: Post;
}
