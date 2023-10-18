import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostPhotosEntity } from '../entities/post-photos.entity';
import { Repository } from 'typeorm';
import { SizePhotoEnum } from 'src/modules/enums/size-photo.enum';

@Injectable()
export class PostImagesRepository {
  constructor(
    @InjectRepository(PostPhotosEntity)
    private readonly postPhotosRepo: Repository<PostPhotosEntity>,
  ) {}

  async findImageByPostIdAndSizeImage(
    postId: number,
    sizeImage: SizePhotoEnum,
  ) {
    return this.postPhotosRepo.findOneBy({ postId, sizePhoto: sizeImage });
  }

  async save(image: PostPhotosEntity) {
    await this.postPhotosRepo.save(image);
  }
}
