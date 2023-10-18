import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogPhotosEntity } from '../entities/blog-photo.entity';
import { Repository } from 'typeorm';
import { BlogFileTypeEnum } from '../enums/blog-file-type.enum';

@Injectable()
export class BlogPhotosRepository {
  constructor(
    @InjectRepository(BlogPhotosEntity)
    private readonly blogPhotoRepo: Repository<BlogPhotosEntity>,
  ) {}
  async save(photo: BlogPhotosEntity) {
    await this.blogPhotoRepo.save(photo);
  }
  async findImageByBlogIdAndFileType(
    blogId: number,
    fileType: BlogFileTypeEnum,
  ) {
    return this.blogPhotoRepo.findOneBy({ blogId, fileType });
  }
}
