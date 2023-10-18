import { Column, Entity, ManyToOne } from 'typeorm';
import { PhotoEntity } from '../../../modules/entities/photo.entity';
import { BlogFileTypeEnum } from '../enums/blog-file-type.enum';
import { Blog } from './blog.entity';

@Entity({ name: 'BlogPhotos' })
export class BlogPhotosEntity extends PhotoEntity {
  @Column({
    type: 'enum',
    enum: BlogFileTypeEnum,
  })
  fileType: BlogFileTypeEnum;

  @Column()
  blogId: number;

  @ManyToOne(() => Blog, (blog) => blog.photos)
  blog: Blog;
}
